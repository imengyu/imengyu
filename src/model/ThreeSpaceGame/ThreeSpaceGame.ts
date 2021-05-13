import { CanvasGameProvider } from "../CanvasGameProvider";
import * as THREE from 'three';
import * as dat from 'dat.gui';
import OrbitControls from 'three-orbitcontrols'
import RendererStats from './utils/threex.rendererstats'
import Stats from './utils/Stats'
import { BaseObject } from "./model/BaseObject"
import { random, randomBoolean } from "./utils/RandomUtil";
import { linearTween } from "./utils/TwenUtils";

export type ThreeSpaceGameActions = 'view'|'collect'|'explode'|'into-music'|'music';

const spectrumWidth = 128;

export class ThreeSpaceGame extends CanvasGameProvider {

  //静态配置
  private objectCount = 2000;
  private objectLineWidth = 20;

  /**
   * 调试gui
   */
  private gui = {
    camZoomSpeed: 0.8,
    camMoveSpeed: 0.05,
    lightOn: true,
    playing: true,
    collectSpeed: 0.5,
    explodeSpeed: 0.3,
  };
  private datGui : dat.GUI = null;
  private scene : THREE.Scene = null;
  private camera : THREE.PerspectiveCamera = null;
  private renderer : THREE.WebGLRenderer = null;
  private controls : OrbitControls = null;
  private rendererStats : RendererStats;
  private stats : Stats;
  private mouse = new THREE.Vector2();
  private INTERSECTED : BaseObject;
  private radius = 100;
  private theta = 0;camMoveSpeed = 0.05;camZoomSpeed = 0.5;camZoomSpeedMusic = 2;camIsZooIn = false;
  private radiusStart = 0;radiusEnd = 0;camZoomMax = 500;camZoomMaxMusic = 1200;camZoomMin = 100;camZeroPos = new THREE.Vector3(0, 0, 5); //Camera auto roate

  private collectSpeed = 0.5;
  private explodeSpeed = 0.3;
  private explodeSpeedBig = 0.2;
  private explodeIsBig = false;

  private mouseDown = false;

  private collectFinishedCallback : () => void = null;
  private intoMusicFinishedCallback : () => void = null;

  private clock = new THREE.Clock();
  private delta = 0;
  private objectPools : Array<BaseObject> = [];
  private ticker = 0;
  private actionControllerTimer = null;

  private globalData : {
    action : ThreeSpaceGameActions,
    playing: boolean,
    canDrag: boolean,
  } = {
    action: 'view',
    playing: true,
    canDrag: false
  };
  private globalDataReal = {
    action : 'view',
    playing: true,
    canDrag: false
  };

  public constructor() {
    super();
    this.bindAllEvents();
  }

  public init(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) {
    super.init(canvas, ctx);

    Object.defineProperties(this.globalData, {
      action: {
        get: () => this.globalDataReal.action,
        set: (val) => {
          if(this.globalDataReal.action!=val){
            this.globalDataReal.action=val;
            this.onActionChanged(val);
          }
        }
      }, 
      playing: {
        get: () => this.globalDataReal.playing,
        set: (val) =>  {
          if(this.globalDataReal.playing!=val){
            this.globalDataReal.playing=val;
          }
        }
      },
      canDrag: {
        get: () => this.globalDataReal.canDrag,
        set: (val)  => {
          if(this.globalDataReal.canDrag!=val){
            this.globalDataReal.canDrag=val;
          }
        }
      }
    });

    this.initScense();
    this.initObjects();
    this.initGui();
    this.initControls();
  }
  public destroy() {
    this.clearObjects();
    this.destroyScense();
    this.destroyGui();
    this.destroyControls();
  }
  public start() {
    this.globalData.playing = true;  
    this.startActionController();
  }
  public stop() {
    this.globalData.playing = false;
    this.stopActionController();
  }

  public setDragEnable(drag: boolean) {
    this.globalData.canDrag = drag;
  }
  public drawSpectrum(analyser : AnalyserNode, voiceHeight : Uint8Array) {
    analyser.getByteFrequencyData(voiceHeight);

    var step = Math.round(voiceHeight.length / spectrumWidth);
    var lines = Math.ceil(this.objectPools.length / this.objectLineWidth);
    var rows = Math.ceil(this.objectPools.length / lines);
    var objectRealCount = this.objectPools.length;
    var index = 0;
    var cube : BaseObject;
    var w = 0;

    var loopInnern = (i : number, h : number) => {
      for(var j = 1; j < rows; j++) {
        index = i * this.objectLineWidth + j;
        if(index < objectRealCount) {
          cube = this.objectPools[index];
          if(j > h) 
            cube.colorValue = 0.1;
          else 
            cube.colorValue = ((h - j) / h + 1);
        }
      }
    }

    var center = Math.ceil(lines / 2);
    for (var i = center; i >= 0; i--) 
      loopInnern(i, (voiceHeight[step * (center - i)] / 200) * rows)
    for (var i = center; i < lines; i++) 
      loopInnern(i, (voiceHeight[step * (i - center)] / 200) * rows)
  }
  public switchSpectrum(on : boolean) {
    if(on) {
      clearTimeout(this.actionControllerTimer);
      if(this.globalData.action != 'into-music' && this.globalData.action != 'music') {
        this.globalData.action = 'into-music';
        this.intoMusicFinishedCallback = () => {
          this.globalData.action = 'music';
        };
      }
    }
    else {
      this.globalData.action = 'collect';
      setTimeout(() => {
        this.resetObjectsMusicScale();
        this.explodeIsBig = false;
        this.globalData.action = 'explode';
        this.actionControllerTimer = setTimeout(() => this.startActionController(), 10000);
      }, random(4, 8) * 1000);
    }
  }

  //=============================
  // Init stub
  //=============================

  private initScense() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
  
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
    this.camera.position.z = this.camZeroPos.z;
  
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas
      }); 
    } catch(e) {
      throw e;
    }
  
    this.renderer.setPixelRatio(window.devicePixelRatio);
    //document.body.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize, false);
  }
  private initObjects() {
  
    let currentSetObjIndex = 0;
    let currentSetObjIndex2 = 0;

    let genParticle = (maxCount : number, tex : THREE.Texture, size: number) => {

      var colorBase = [ 0, 0.5922, 1 ];
      let geometry = new THREE.BufferGeometry();
      let positions = new Array<number>();
      let colors = new Array<number>();
      let color = new THREE.Color();

      for (var i = 0; i < maxCount; i ++, currentSetObjIndex2++) {
        color = new THREE.Color(Math.random() * 0.2 + colorBase[0], Math.random() * 0.6 + colorBase[1], colorBase[2] - Math.random() * 0.2);
  
        let x = Math.random() * 1200 - 600, y = Math.random() * 1200 - 600, z = Math.random() * 1200 - 600;
        let object = new BaseObject();
  
        object.index = i;
        object.baseColor = color;
        object.randSpeed = random(9, 12) / 10;
        object.musicPosition.x = Math.floor((currentSetObjIndex2 + this.objectLineWidth) % this.objectLineWidth) * 25 - (this.objectLineWidth * 25 / 2);
        object.musicPosition.z = Math.floor(currentSetObjIndex2 / this.objectLineWidth) * 25 - (this.objectCount / this.objectLineWidth * 25 / 2);
  
        positions.push(x, y, z);
        colors.push(color.r, color.g, color.b);
    
        this.objectPools.push(object);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      let points = new THREE.Points(geometry, new THREE.PointsMaterial({
        size: size,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        //alphaTest: 0.5,
        //map: tex,
        blending: THREE.AdditiveBlending
      }));

      for (var i = currentSetObjIndex, c = currentSetObjIndex + maxCount; i < c; i ++) 
        this.objectPools[i].points = points;
      currentSetObjIndex += maxCount;

      return points;
    };

    this.scene.add(genParticle(this.objectCount, null, 5));
  }
  private initGui() {

    if(localStorage.getItem('debugGame') !== 'true')
      return;

    this.datGui = new dat.GUI({
      closed: false
    });
    //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
    this.datGui.add(this.gui, "camZoomSpeed", 0, 10);
    this.datGui.add(this.gui, "camMoveSpeed", 0, 1);
    this.datGui.add(this.gui, "collectSpeed", 0, 5);
    this.datGui.add(this.gui, "explodeSpeed", 0, 10);
    this.datGui.add(this.gui, 'lightOn', this.gui.lightOn);
    this.datGui.add(this.globalData, 'action', [ 'view','collect','explode','into-music','music' ]);
  
    //Stats 
  
    this.stats	= new Stats();
    this.stats.domElement.style.position	= 'absolute'
    this.stats.domElement.style.left = '0px'
    this.stats.domElement.style.top	= '0px'
    document.body.appendChild(this.stats.domElement )
    
    this.rendererStats = new RendererStats();
    this.rendererStats.domElement.style.position	= 'absolute'
    this.rendererStats.domElement.style.left	= '0px'
    this.rendererStats.domElement.style.top	= '50px'
    document.body.appendChild(this.rendererStats.domElement)
  }
  private initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 1;
    this.controls.rotateSpeed = 0.2;
    // How far you can dolly in and out ( PerspectiveCamera only )
    this.controls.minDistance = 100;
    this.controls.maxDistance = 2500;
    this.controls.enablePan = true; 

    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
    document.addEventListener('mousedown', this.onDocumentMouseDown);

    document.addEventListener('touchend', this.onDocumentTouchEnd);
    document.addEventListener('touchstart', this.onDocumentTouchStart);
    document.addEventListener('touchmove', this.onDocumentToucheMove);

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }
  private startActionController() {
    this.globalData.action = 'view';
    clearTimeout(this.actionControllerTimer);
    this.actionControllerTimer = setTimeout(() => {
      this.globalData.action = 'collect';
      this.explodeIsBig = randomBoolean(0.2);
      clearTimeout(this.actionControllerTimer);
      this.collectFinishedCallback = () => {
        this.globalData.action = 'explode';
        clearTimeout(this.actionControllerTimer);
        this.actionControllerTimer = setTimeout(() => {
          this.globalData.action = 'view';
          clearTimeout(this.actionControllerTimer);
          this.actionControllerTimer = setTimeout(() => {
            this.globalData.action = 'collect';
            this.explodeIsBig = randomBoolean(0.8);
            clearTimeout(this.actionControllerTimer);
            this.collectFinishedCallback = () => {
              this.startActionController();
            };
          }, random(20, 60) * 1000);
        }, random(40, 60) * 1000);
      };
    }, random(30, 40) * 1000);
  }
  private stopActionController() {
    this.globalData.action = 'view';
    clearTimeout(this.actionControllerTimer);
  }

  //=============================
  // Destroy stub
  //=============================

  private destroyScense() {
    this.scene.clear();
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    //document.body.removeChild(this.renderer.domElement);
    window.removeEventListener('resize', this.onWindowResize, false);
  }
  private clearObjects() {
    this.objectPools = null;
  }
  private destroyGui() {
    this.datGui = null
    //Stats 
    document.body.removeChild(this.stats.domElement)
    document.body.removeChild(this.rendererStats.domElement)    
    this.stats = null;
    this.rendererStats = null;
  }
  private destroyControls() {
    this.controls = null;

    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    document.removeEventListener('mousedown', this.onDocumentMouseDown);

    document.removeEventListener('touchend', this.onDocumentTouchEnd);
    document.removeEventListener('touchstart', this.onDocumentTouchStart);
    document.removeEventListener('touchmove', this.onDocumentToucheMove);

    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  //=============================
  // Render stub
  //=============================

  
  private resetObjectsState(action : ThreeSpaceGameActions) {
    let cube : BaseObject = null;
    if(action == 'collect'){
      for(let start = 0; start < this.objectPools.length; start++) {
        cube = this.objectPools[start];
        cube.collected = false;
      }
    }
    else if(action == 'explode') {
      for(let start = 0; start < this.objectPools.length; start++) {
        cube = this.objectPools[start];
        cube.collected = true;
        cube.explodeTargetArrived = false;
        cube.explodeTargetMaked = false;
      }
    }
    else if(action == 'into-music') {
      for(let start = 0; start < this.objectPools.length; start++) {
        cube = this.objectPools[start];
        cube.musicPositionArrived = false;
      }
    }
    else if(action == 'music') {
      var lines = Math.ceil(this.objectPools.length / this.objectLineWidth);
      var rows = Math.ceil(this.objectPools.length / lines);
      for(let start = 0; start < this.objectPools.length; start++) {
        cube = this.objectPools[start];
        cube.colorValue = (start % rows == 0) ? 1 : 0.1
      }
    }
  }
  private resetObjectsMusicScale() {
    for(let start = 0; start < this.objectPools.length; start++)
      this.objectPools[start].colorValue = 1;
  }
  private collectObjects() {
    let zeroPos = new THREE.Vector3(0, 0, 0);
    let cube : BaseObject = null;
    let collectCount = 0;
    for(var start = 0; start < this.objectPools.length; start++) {
      cube = this.objectPools[start];
      if(!cube.collected) {
        cube.position = cube.position.lerp(zeroPos, this.collectSpeed * this.delta * cube.randSpeed);
        collectCount ++;
        if(cube.position.distanceTo(zeroPos) < 2) {
          cube.collected = true;
          cube.explodeTargetMaked = false;
          cube.explodeTargetArrived = false;
        }
      }
    }
    if(collectCount < 50) {
      if(typeof this.collectFinishedCallback == 'function'){
        this.collectFinishedCallback();
        this.collectFinishedCallback = null;
      }
    }
  }
  private explodeObjects() {
    let cube : BaseObject = null;
    let maxExplode = this.explodeIsBig ? 4000 : 2000;
    let explodeSpeedThis = this.explodeIsBig ? this.explodeSpeedBig : this.explodeSpeed;
    for(var start = 0; start < this.objectPools.length; start++) {
      cube = this.objectPools[start];
      cube.collected = false;
      if(!cube.explodeTargetArrived) {
        if(!cube.explodeTargetMaked) {
          cube.explodeTarget.x = random(-maxExplode, maxExplode);
          cube.explodeTarget.y = random(-maxExplode, maxExplode);
          cube.explodeTarget.z = random(-maxExplode, maxExplode);
          cube.explodeTargetMaked = true;
        }
        cube.position = cube.position.lerp(cube.explodeTarget, explodeSpeedThis * this.delta * cube.randSpeed);

        if(cube.position.distanceTo(cube.explodeTarget) < 2){
          cube.explodeTargetArrived = false;
        }
      }
    }
  }
  private moveToMusicObjects() {
    let cube : BaseObject = null;
    let collectCount = 0;
    for(var start = 0; start < this.objectPools.length; start++) {
      cube = this.objectPools[start];
      cube.collected = false;
      if(!cube.musicPositionArrived) {
        cube.position = cube.position.lerp(cube.musicPosition, 1.2 * this.delta);
        collectCount++;

        if(cube.position.distanceTo(cube.musicPosition) < 1)
          cube.musicPositionArrived = true;
      }
    }
    if(collectCount < 5) {
      if(typeof this.intoMusicFinishedCallback == 'function'){
        this.intoMusicFinishedCallback();
        this.intoMusicFinishedCallback = null;
      }
    }
  }
  private roateCamera() {

    this.theta += this.camMoveSpeed;

    if(this.radius > this.camZoomMaxMusic) {
      this.camIsZooIn = false;
      this.radius = this.camZoomMaxMusic;
      this.radiusStart = this.camZoomMaxMusic;
    }
    if(this.globalData.action == 'view') {  
      if(this.camIsZooIn) {
        if(this.radius < this.camZoomMax - 10) this.radius += linearTween(this.radiusStart, this.camZoomMax, this.radius, this.camZoomSpeed, 0.35, 0.35) + 0.01;
        else { 
          this.camIsZooIn = false;
          this.radiusStart = this.camZoomMax;
        }
      }else {
        if(this.radius > this.camZoomMin + 10) this.radius -= linearTween(this.camZoomMin, this.radiusStart, this.radius, this.camZoomSpeed, 0.35, 0.35) + 0.01;
        else { 
          this.camIsZooIn = true;
          this.radiusStart = this.camZoomMin;
        }
      }
    //}else if(globalData.action == 'into-music' || globalData.action == 'music') {
    //  if(radius > camZoomMin + 10) radius -= linearTween(camZoomMin, (camZoomMax - radiusStart) * 0.3,
    //      radiusStart, radiusStart - (camZoomMax - radiusStart) * 0.2, radius, camZoomSpeed);
    }else if(this.globalData.action == 'into-music' || this.globalData.action == 'music') {
      if(this.radius < this.camZoomMaxMusic - 10) this.radius += linearTween(this.radiusStart, this.camZoomMaxMusic, this.radius, this.camZoomSpeedMusic, 0.35, 0.35) + 0.02;
    }else {
      if(this.radius < this.camZoomMax - 10) this.radius += linearTween(this.radiusStart, this.camZoomMax, this.radius, this.camZoomSpeed, 0.35, 0.35) + 0.02;
    }

    this.camera.position.x = this.radius * -Math.sin(THREE.MathUtils.degToRad(this.theta));
    this.camera.position.y = this.radius * Math.sin(THREE.MathUtils.degToRad(this.theta));
    this.camera.position.z = this.radius * Math.cos(THREE.MathUtils.degToRad(this.theta));
    this.camera.lookAt(this.scene.position);
    this.camera.updateMatrixWorld();
    
  }
  private updateGuiProps() {
    this.camZoomSpeed = this.gui.camZoomSpeed;
    this.camMoveSpeed = this.gui.camMoveSpeed;
    this.collectSpeed = this.gui.collectSpeed;
    this.explodeSpeed = this.gui.explodeSpeed;
  }

  //=============================
  // Render main
  //=============================

  render(deltatime : number) {
    
    this.ticker++;
    if(this.ticker > 10000) this.ticker = 0;

    if(this.datGui) this.updateGuiProps();
    this.delta = this.clock.getDelta();

    let action = this.globalData.action;
    if(action === 'view') {}
    else if(action === 'collect') this.collectObjects();
    else if(action === 'explode') this.explodeObjects();
    else if(action === 'into-music') this.moveToMusicObjects();
    else if(action === 'music' && this.drawSpectrumCallback) this.drawSpectrumCallback();

    if(this.globalData.canDrag) this.controls.update();
    else this.roateCamera();
    
    this.renderer.render(this.scene, this.camera);

    //Update others part
    if(this.rendererStats) this.rendererStats.update(this.renderer);
    if(this.stats) this.stats.update();
  }

  //=============================
  // Data events
  //=============================

  private onActionChanged(newV : ThreeSpaceGameActions) {
    this.radiusStart = this.radius;
    if(newV == 'collect') this.resetObjectsState('collect');
    else if(newV == 'explode') this.resetObjectsState('explode');
    else if(newV == 'into-music') {
      this.resetObjectsState('into-music');
      setTimeout(() => {
        this.globalData.action = 'music';
      }, 10000)
    }
    else if(newV == 'music') this.resetObjectsState('music');  
  }

  //=============================
  // Global events
  //=============================

  bindAllEvents() {
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this);
    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
    this.onDocumentTouchEnd = this.onDocumentTouchEnd.bind(this);
    this.onDocumentToucheMove = this.onDocumentToucheMove.bind(this);
    this.onDocumentTouchStart = this.onDocumentTouchStart.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  onDocumentMouseMove(event : MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }
  onDocumentMouseDown(event : MouseEvent) {
    this.mouseDown = true;
  }
  onDocumentMouseUp(event : MouseEvent) {
    this.mouseDown = false;
    if(this.INTERSECTED != null) {
      if(this.globalData.action == 'collect' && this.INTERSECTED.collected) {
        clearTimeout(this.actionControllerTimer);
        this.globalData.action = 'explode';
        this.actionControllerTimer = setTimeout(() => {
          clearTimeout(this.actionControllerTimer);
          this.startActionController();
        }, 10000);
      }
    }
  }
  onDocumentTouchEnd(event : TouchEvent) {
    this.onDocumentMouseUp(null);
  }
  onDocumentToucheMove(event : TouchEvent) {
    if(event.touches.length > 0) {
      this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }
  onDocumentTouchStart(event : TouchEvent) {
    if(event.touches.length > 0) {
      this.mouseDown = true;
      this.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }
  onKeyDown(event : KeyboardEvent) {

  };
  onKeyUp(event : KeyboardEvent) {

  };
}