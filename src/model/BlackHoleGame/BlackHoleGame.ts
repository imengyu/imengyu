import Utils from "@/utils/Utils";
import { CanvasGameProvider } from "../CanvasGameProvider";

const random = Utils.randomNum;

const shader_fs = '\
varying mediump vec4 v_color;\
void main(void) {\
  gl_FragColor = v_color;\
}\
';
const shader_vs = '\
attribute vec3 vertexPosition;\
attribute vec4 vertexColor;\
varying mediump vec4 v_color;\
void main(void) {\
  v_color = vertexColor;\
  gl_PointSize = 3.0;\
  gl_Position = vec4(vertexPosition, 1.0);\
}\
';
//Cfg
const max_particles = 2048;
const max_radius = 500;
const min_radius = 60;
const min_speed = 0.1;
const max_speed = 0.8;
const min_explode_speed = 4;
const max_explode_speed = 10;
const alpha_trans_speed = 0.005;
const alpha_trans_speed_slow = 0.001;
const alpha_trans_speed_fast = 0.01;
const mst_trans_speed = 0.005;
const min_blackhole_gravitation_speed = 0.005;
const max_blackhole_gravitation_speed = 0.01;
const blackhole_gravitation_tick_time = 5000;
const spectrum_width = 128;
const spectrum_height = 16;
const spectrum_min_h = min_radius;
const spectrum_spacing = 6;
const vertices_block_data_count = 7;
const modeArr = ['none','roate','explode','explode-quadrant','explode-2','fly','spectrum','hidden', 'love', 'wave'];

export function getBlackHoleModes() : string[] { return modeArr; }
export type BlackHoleWorkMode = 'none'|'roate'|'explode'|'explode-quadrant'|'explode-2'|'fly'|
  'spectrum'|'hidden'|'love'|'wave';

let globalRanom = 0;

class Vector3 {
  x = 0.0;
  y = 0.0;
  z = 0.0;

  constructor(x : number, y : number, z : number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  sub(v : Vector3) {
    return vector3Temp.setV(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z);
  }
  add(v : Vector3) {
    return vector3Temp.setV(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z);
  }
  multi(v : Vector3) {
    return vector3Temp.setV(
      this.x * v.x,
      this.y * v.y,
      this.z * v.z);
  }
  abs() {  
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    this.z = Math.abs(this.z);
    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  set(v : Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  setV(x : number, y : number, z : number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
}
class Particle {

  public constructor(game : BlackHoleGame) {
    this.game = game;
    this.vertices = this.game.vertices
  }

  vertices : Float32Array|null = null;

  private game : BlackHoleGame;

  positionLast = new Vector3(0,0,0);
  position = new Vector3(0,0,0);
  positionTransStart = new Vector3(0,0,0);//移动开始点
  positionTransTarget = new Vector3(0,0,0);//移动目标

  d = 0.0;//旋转角度
  r = 0.0;//圆心半径
  alpha = 1.0;//透明度
  alphaTransSpeed = alpha_trans_speed;//透明度
  alphaEnd = 1.0;//透明度渐变目标
  speed = 1;//速度
  color = particle_color.clone();
  colorTransEnd = new Vector3(0,0,0);

  lt = 0;//要移动的长度
  mst = 0;//移动步长
  mstEnd = 1.0;//透明度渐变目标
  fType : 'x'|'y' = 'x';//
  arHoleTick = 0;
  
  resetedRadius = false;//半径重置
  positionArrived = false;//移动目标位置到达
  alphaTrans = false;//执行alpha渐变
  mstTrans = false;//执行mst渐变



  holeAttraction() {
    const sp = 
      min_blackhole_gravitation_speed +
      (Math.abs(max_radius - this.r) / max_radius) * 
      (max_blackhole_gravitation_speed - min_blackhole_gravitation_speed);
    
    if (this.r <= min_radius) { 
      if(this.arHoleTick < blackhole_gravitation_tick_time) {
        this.arHoleTick++;
        this.alpha = (blackhole_gravitation_tick_time - this.arHoleTick) / blackhole_gravitation_tick_time;
      }
      else {
        this.r = random(min_radius, max_radius);
        this.resetedRadius = true; 
        this.alpha = 0;
        this.alphaEnd = this.calcAlpha(false);
        this.alphaTrans = true;
        this.arHoleTick = 0;
      }
    }else {
      this.r -= sp;
      this.r += (globalRanom % 3 == 0 ? sp : -sp);
    }

    this.calcSpeed();
  }
  roate() {
    this.d += this.speed;
    this.calcPos();
    
    if(this.resetedRadius) {
      this.positionLast.set(this.position);
      this.resetedRadius = false;
    }
  }
  explodeMove() {
    if(!this.positionArrived) {

      this.positionLast.set(this.position);

      const diff = this.position.sub(this.positionTransTarget).abs();
      if(diff.y <= this.mst) {
        this.positionArrived = true;
        return;
      }

      if(this.position.y < this.positionTransTarget.y) this.position.y += this.mst;
      else if(this.position.y > this.positionTransTarget.y) this.position.y -= this.mst;

      this.position.x=(Math.pow(this.r,2)-this.position.y*this.positionTransStart.y)/this.positionTransStart.x;
    }
  }
  explodeMoveQuadrant() {
    if(!this.positionArrived) {

      this.positionLast.set(this.position);

      const diff = this.position.sub(this.positionTransTarget).abs();
      if(diff.x < 0.5 && diff.y < 0.5) {
        this.positionArrived = true;
        return;
      }

      if(this.fType == 'x') {
        if(this.position.x < this.positionTransTarget.x) this.position.x += this.speed;
        else if(this.position.x > this.positionTransTarget.x) this.position.x -= this.speed;

        this.position.y=(Math.pow(this.r,2)-this.position.x*this.positionTransTarget.x)/this.positionTransTarget.y;
      }if(this.fType == 'y') {
        if(this.position.y < this.positionTransTarget.y) this.position.y += this.speed;
        else if(this.position.y > this.positionTransTarget.y) this.position.y -= this.speed;

        this.position.x=(Math.pow(this.r,2)-this.position.y*this.positionTransTarget.y)/this.positionTransTarget.x;
      }
    }
  }
  explodeMove2() {
    if(!this.positionArrived) {

      this.positionLast.set(this.position);

      const diff = this.position.sub(this.positionTransTarget);

      if(this.fType == 'x') {
        if(diff.x < 0) this.position.x += this.speed;
        else if(diff.x > 0) this.position.x -= this.speed;

        this.position.y=(Math.pow(this.r,2)-this.position.x*this.positionTransStart.x)/this.positionTransStart.y;
      }if(this.fType == 'y') {
        if(diff.y < 0) this.position.y += this.speed;
        else if(diff.y > 0) this.position.y -= this.speed;

        this.position.x=(Math.pow(this.r,2)-this.position.y*this.positionTransStart.y)/this.positionTransStart.x;
      }

      diff.abs();
      if(diff.x < 0.5 && diff.y < 0.5) {
        this.positionArrived = true;
        return;
      }
    }
  }
  move() {
    if(!this.positionArrived) {

      const diffX = Math.abs(this.position.x - this.positionTransTarget.x);
      const diffY = Math.abs(this.position.y - this.positionTransTarget.y);
      if(diffX < this.speed && diffY < this.speed) {
        this.positionArrived = true;
        this.position.set(this.positionTransTarget);
        return false;
      }

      if(this.position.x < this.positionTransTarget.x - this.speed) this.position.x += this.speed;
      else if(this.position.x > this.positionTransTarget.x + this.speed) this.position.x -= this.speed;

      if(this.position.y < this.positionTransTarget.y - this.speed) this.position.y += this.speed;
      else if(this.position.y > this.positionTransTarget.y + this.speed) this.position.y -= this.speed;

      return true;
    }

    return false;
  }

  waveOn = false;
  waveData : {
    xStart: number,
    x: number,
    yStart: number,
    height: number,
    offest: number,
  } = {
    xStart: 0,
    x: 0,
    yStart: 0,
    height: 0,
    offest: 0,
  };
  waveTransXLess = false;
  waveTransSpeed = 0.1;

  wave() {

    if(this.waveOn) {
      if(!this.waveTransXLess) {
        this.waveData.x += this.waveTransSpeed;
        this.position.y = (this.waveData.height * 0.8) * Math.sin(this.waveData.x) + this.waveData.offest;
        if(this.waveData.x > 10) this.waveTransXLess = false;

      }else {
        this.waveData.x -= this.waveTransSpeed;
        this.position.y = (this.waveData.height * 0.8) * Math.sin(this.waveData.x) + this.waveData.offest;
        if(this.waveData.x < this.waveData.xStart) {
          //this.waveTransXLess = false;
          this.waveOn = false;
          this.position.y = this.waveData.yStart;
        }
      }
    }
  }

  getD() {
    if(this.d > 360) return this.d % 360;
    return this.d;
  }

  copyPos(i : number) {
    const width = this.game.width;
    const height = this.game.height;
    const vertices = this.vertices;

    if(vertices) {
      vertices[i * vertices_block_data_count + 0] = (this.position.x) / (width / 2);
      vertices[i * vertices_block_data_count + 1] = (this.position.y) / (height / 2);
      vertices[i * vertices_block_data_count + 2] = (this.position.z) / (height / 2);
    }
  }
  copyColor(i : number) {
    const vertices = this.vertices;

    if(vertices) {
      vertices[i * vertices_block_data_count + 3] = this.color.x;
      vertices[i * vertices_block_data_count + 4] = this.color.y;
      vertices[i * vertices_block_data_count + 5] = this.color.z;
      vertices[i * vertices_block_data_count + 6] = this.alpha;
    }
  }


  calcRadius() {
    this.r = Math.sqrt(Math.pow(this.position.x, 2) + Math.pow(this.position.y, 2));
  }
  calcPos() {
    this.positionLast.set(this.position);
    this.position.x = this.r * Math.cos(this.getD() * Math.PI / 180);
    this.position.y = this.r * Math.sin(this.getD() * Math.PI / 180);
  }
  calcSpeed() {
    this.speed = 
      min_speed +
      (Math.abs(max_radius - this.r) / max_radius) * 
      (max_speed - min_speed) 
    if (this.speed < min_speed) this.speed = min_speed;
    if (this.speed > max_speed) this.speed = max_speed;
  }
  calcAlpha(set  = true) {
    let a = (max_radius - this.r) / max_radius;
    if (a < 0.1) a = 0.1;
    if (a > 1) a= 1;
    if (set) this.alpha = a;
    return a;
  }

  transMstExplode() {
    if(this.mst < this.mstEnd) this.mst += mst_trans_speed;
    else if(this.mst > this.mstEnd) this.mst -= mst_trans_speed;

    if(Math.abs(this.mst - this.mstEnd) < mst_trans_speed) {
      this.mst = this.mstEnd;
      this.mstTrans = false;
    }
  }
  transAlphaRoate() {
    if(this.alpha < this.alphaEnd) this.alpha += this.alphaTransSpeed;
    else if(this.alpha > this.alphaEnd) this.alpha -= this.alphaTransSpeed;

    if(Math.abs(this.alpha - this.alphaEnd) < this.alphaTransSpeed) {
      this.alpha = this.alphaEnd;
      this.alphaTrans = false;
    }
  }
  transAlphaExplode() {
    if(this.alpha > 0) this.alpha -= alpha_trans_speed_slow ;

    if(Math.abs(this.alpha - 0) < alpha_trans_speed_slow) {
      this.alpha = 0;
      this.alphaTrans = false;
    }
  }
  transAlphaHidden() {
    if(this.alpha > 0) this.alpha -= alpha_trans_speed_fast;

    if(Math.abs(this.alpha - 0) < alpha_trans_speed_fast) {
      this.alpha = 0;
      this.alphaTrans = false;
    }
  }

  isLove = false;
  alphaLess = false;
  loveAlphaMin = 0.01;
  loveAlphaMax = 1;

  transAlphaLove() {
    if(this.alphaLess) {
      if(this.alpha > this.loveAlphaMin) this.alpha -= alpha_trans_speed * 2;
      if(Math.abs(this.alpha - this.loveAlphaMin) < alpha_trans_speed) 
        this.alphaLess = false
    }else {
      if(this.alpha < this.loveAlphaMax) this.alpha += alpha_trans_speed * 2;
      if(Math.abs(this.alpha - this.loveAlphaMax) < alpha_trans_speed) 
        this.alphaLess = true
    }
  }
}

const vector3Temp = new Vector3(0, 0, 0);
const particle_color = new Vector3(0.4, 0.5, 0.7);
const particle_spectrum_color = new Vector3(0.12, 0.15, 0.17);

export interface BlackholeWorkModeChangeCallbackFunction {
  (mode: BlackHoleWorkMode): void;
}

export class BlackHoleGame extends CanvasGameProvider {

  anim_running = false;
  anim_id = 0;

  gl: WebGLRenderingContext|null = null;
  particles: Array<Particle> = [];
  globalRanom = 0;
  autoTimer = 0;
  autoTimer2 = 0;
  autoTimer2Tick = 0;
  autoTimer2TickNext = 0;

  width = 0;
  height = 0;

  deltatime = 0;

  vertexBuffer : WebGLBuffer|null = null;
  vertices = new Float32Array();

  mode : BlackHoleWorkMode = 'none';
  modeInt = 0;
  modeChangeCallback : BlackholeWorkModeChangeCallbackFunction|null  = null;
  
  public setBlackholeWorkModeChangeCallback(callback: BlackholeWorkModeChangeCallbackFunction) : void {
    this.modeChangeCallback = callback;
  }

  public switchSpectrum(on : boolean) : void {
    if(on) this.setBlackHoleWorkMode('spectrum')
    else{
      for (let i = 0; i < max_particles; i++){
        this.particles[i].alpha = i % spectrum_height == 0 ? 1 : 0.05;
        this.particles[i].color.set(particle_color);
      }
      this.autoTimer2TickNext = 5;
      this.blackholeRandomExplode('roate');
    }
  }
  public drawSpectrum(analyser : AnalyserNode, voiceHeight : Uint8Array) : void {
    analyser.getByteFrequencyData(voiceHeight);

    const step = Math.round(voiceHeight.length / spectrum_width);
    const lines = spectrum_width;
    const rows = spectrum_height;
    let index = 0;
    let particle : Particle;

    for (let i = 0; i < max_particles; i++){
      this.particles[i].alpha = 1;
      this.particles[i].color.set(particle_spectrum_color);
    }

    const loopInnern = (i : number, h : number) => {

      for(let j = 1; j < rows; j++) {
        index = i * spectrum_height + j;

        const r = (i / center) * ((h / spectrum_height));
        const g = ((rows - j) / rows) * (h / spectrum_height);
        const b = (j / rows) * ((center - i) / center) * (1 - (h / spectrum_height));

        if(index < max_particles) {
          particle = this.particles[index];
          if(j < h) {  
            particle.alpha = 1;
            particle.color.x = ((360 - particle.getD()) / 360) + r;
            particle.color.y = g;
            particle.color.z = (particle.getD() / 360) + b;
          }
        }
        
      }
    }

    const center = Math.ceil(lines / 2);
    for (let i = center; i >= 0; i--) 
      loopInnern(i, (voiceHeight[step * (center - i)] / 250) * rows)
    for (let i = center; i < lines; i++) 
      loopInnern(i, (voiceHeight[step * (i - center)] / 250) * rows)
    
  }
  public resize(w : number, h: number) : void {
    this.width = w;
    this.height = h;
    if(this.gl)
      this.gl.viewport(0, 0, this.width, this.height);
  }
  public init(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) : void {
    super.init(canvas, ctx);

    if(this.canvas) {
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.gl = this.canvas.getContext('webgl') as WebGL2RenderingContext;
    }

    const gl = this.gl;
    if(!gl) {
      alert("getContext failed! ");
      return;
    }

    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);/*清空画板上的颜色，并初始化颜色*/
    gl.clearDepth(0.4);//设定canvas初始化时候的深度
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//清空画面上的颜色
  
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    
    //顶点着色器和片段着色器生成
    const v_shader = create_shader(gl, shader_vs, 'x-shader/x-vertex');
    const f_shader = create_shader(gl, shader_fs, 'x-shader/x-fragment');
    if(!v_shader || !f_shader)
      return;

    const program = create_program(gl, v_shader, f_shader); // 程序对象的生成和连接
    if(!program)
      return;

    this.initParticles();//初始化粒子
  
    const vertexPosition = gl.getAttribLocation(program, "vertexPosition");
    const vertexColor = gl.getAttribLocation(program, "vertexColor");
  
    this.vertexBuffer = gl.createBuffer(); //创建缓冲区
    if(!this.vertexBuffer){
      console.error("Failed to createthe buffer object vertexBuffer");//缓冲区创建失败
      return;
    }
  
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer); //将缓冲区绑定到目标对象
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW); //向缓冲区写入数据
  
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, vertices_block_data_count * 4, 0);
    gl.enableVertexAttribArray(vertexPosition);
  
    gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, vertices_block_data_count * 4, 3 * 4);
    gl.enableVertexAttribArray(vertexColor);
  
    gl.lineWidth(1);
  }
  public destroy() : void {
    this.stop();
    this.particles.splice(0, this.particles.length);
  }
  public render(deltatime : number) : void {
    this.deltatime = deltatime;
    globalRanom = random(0, 360);
    this.update();
  }
  public start() : void {
    if (this.anim_running) return;

    this.anim_running = true;
  
    this.setBlackHoleWorkMode('roate');
    this.buildParticles();
  
    this.autoTimer2 = setInterval(this.autoTimerWorker.bind(this), 1000);
    this.autoTimer2Tick = 0;
    this.autoTimer2TickNext = random(40, 60);
    //this.autoTimer = setTimeout(() => setBlackHoleWorkMode('explode'), random(350000, 600000));
  }
  public stop() : void {
    if (!this.anim_running) return;

    this.anim_running = false;
    this.setBlackHoleWorkMode('hidden');

    clearInterval(this.autoTimer2);
    clearInterval(this.autoTimer);
    this.autoTimer = setTimeout(() => {
      cancelAnimationFrame(this.anim_id);
      this.anim_id = 0;
    }, 2000);

    clearInterval(this.autoTimer2);
  }

  private initParticles() {
    this.vertices = new Float32Array(max_particles * vertices_block_data_count);
    for (let i = 0; i < max_particles; i++) this.particles.push(new Particle(this));
  }

  //auto thread
  roateTick = 0;
  loveTick = 0;
  waveTick = 0;

  autoTimerWorker() : void {
    this.autoTimer2Tick++;
    //console.log(`autoTimerWorker: ${this.autoTimer2Tick} > ${this.autoTimer2TickNext}`);
    if(this.autoTimer2Tick > this.autoTimer2TickNext) {
      this.autoTimer2Tick = 0;
  
      if(this.getBlackHoleWorkMode() == 'roate') {
        const re = random(0, 1);
        if(re == 2){
          this.autoTimer2TickNext = random(30, 60);
          this.blackholeRandomExplode('wave');
        } else if(re == 0 || (this.roateTick > 2 && this.loveTick <= 2)){
          this.autoTimer2TickNext = random(80, 100);
          this.blackholeRandomExplode('love');
          this.roateTick++;
          this.loveTick = 0;
        } else if(re == 1 || (this.loveTick > 2 && this.roateTick <= 2)){
          this.autoTimer2TickNext = random(10, 50);
          this.blackholeRandomExplode('roate');
          this.loveTick++;
          this.roateTick = 0;
        }
        
      }else if(this.getBlackHoleWorkMode() == 'love') {
        this.blackholeRandomExplode();
        this.autoTimer2TickNext = random(30, 50);
      }else if(this.getBlackHoleWorkMode() != 'none' && this.getBlackHoleWorkMode() != 'spectrum') {
        this.setBlackHoleWorkMode('roate');
        this.autoTimer2TickNext = random(40, 60);
      }
    }
  }
  blackholeRandomExplode(nextMode : BlackHoleWorkMode = 'roate') : void {
    const r = random(0, 30);
    clearInterval(this.autoTimer);
    this.autoTimer = setTimeout(() => {
      if(r % 2 == 0) {
        clearInterval(this.autoTimer);
        this.setBlackHoleWorkMode('explode');
        this.autoTimer = setTimeout(() => this.setBlackHoleWorkMode(nextMode), 8500);
      }else if(r % 3 == 0) {
        this.setBlackHoleWorkMode('explode-2');
        clearInterval(this.autoTimer);
        this.autoTimer = setTimeout(() => this.setBlackHoleWorkMode(nextMode), 8500);
      }else {
        this.setBlackHoleWorkMode('explode-quadrant');
        clearInterval(this.autoTimer);
        this.autoTimer = setTimeout(() => this.setBlackHoleWorkMode(nextMode), 8500);
      }
    }, 1200);
  }

  getBlackHoleWorkMode() : BlackHoleWorkMode { return this.mode; }
  setBlackHoleWorkMode(newMode : BlackHoleWorkMode) : void {
    const oldMode = this.mode;

    this.mode = newMode;
    this.modeInt = modeArr.indexOf(newMode);

    if(newMode != oldMode && this.modeChangeCallback) this.modeChangeCallback(this.mode);

    switch(newMode) {
      case 'explode': 
        this.buildExplodeParticles();  
        break;
      case 'explode-quadrant': 
        this.buildExplodeQuadrantParticles();  
        break;
      case 'explode-2': 
        this.buildExplode2Particles();  
        break;
      case 'roate': 
        this.buildParticles(); 
        break;
      case 'love': 
        this.buildLoveParticles(); 
        break;
      case 'wave': 
       this.buildWaveParticles(); 
        break;
      case 'spectrum': 
        if(oldMode != 'spectrum') {
          this.buildSpectrumParticlesStart(); 
          clearInterval(this.autoTimer);
          this.autoTimer = setTimeout(() => {
            this.buildSpectrumParticlesEnd();
          }, 2000);
        }
        break;
    }
  }

  update() : void {
    const gl = this.gl;
    const particles = this.particles;
    const modeInt = this.modeInt;

    let particle : Particle|null = null;

    if(!gl)
      return;
  
    if(modeInt == 1) {
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        particle.holeAttraction();
        particle.roate();
  
        if(particle.alphaTrans) particle.transAlphaRoate();
        else particle.calcAlpha();
  
        particle.copyPos(i);
        particle.copyColor(i);
  
      }
    }else if(modeInt == 2) {
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        if(particle.mstTrans)
          particle.transMstExplode();
        particle.explodeMove();
        particle.transAlphaExplode();
        particle.copyPos(i);
        particle.copyColor(i);
      }
    }else if(modeInt == 3) {
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        particle.explodeMoveQuadrant();
        particle.transAlphaExplode();
        particle.copyPos(i);
        particle.copyColor(i);
        
      }
    }else if(modeInt == 4) {
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        particle.explodeMove2();
        particle.transAlphaExplode();
        particle.copyPos(i);
        particle.copyColor(i);
      }
    }else if(modeInt == 5) {
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        if(particle.alphaTrans) particle.transAlphaRoate();
        if(particle.move())
          particle.copyPos(i);
        particle.copyColor(i);
      }
    }else if(modeInt == 6) {
      if(this.drawSpectrumCallback) this.drawSpectrumCallback();
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        if(particle.alphaTrans) particle.transAlphaRoate();
        particle.roate();
        particle.copyPos(i);
        particle.copyColor(i);
      }
    }else if(modeInt == 7) {
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        particle.transAlphaHidden();
        particle.roate();
        particle.copyPos(i);
        particle.copyColor(i);
      }
    }else if(modeInt == 8) {
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        
        if(particle.move())
          particle.copyPos(i);
        if(particle.isLove) {
          particle.transAlphaLove();
        }else {
          if(particle.alphaTrans) particle.transAlphaRoate();
          else particle.transAlphaLove();
          particle.roate();
          particle.copyPos(i);
        }
  
        particle.copyColor(i);
      }
    }else if(modeInt == 9) {
      for(let i = 0; i < max_particles; i++) {
        particle = particles[i];
        if(particle.positionArrived) particle.wave();
        else particle.move();
        if(particle.alphaTrans) particle.transAlphaRoate();
        particle.copyPos(i);
        particle.copyColor(i);
      }
    }
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, max_particles);
  }

  //mode builders

  buildParticles() : void {
    const particles = this.particles;
    let particle: Particle|null = null;

    for (let i = 0; i < max_particles; i++) {
      particle = particles[i];
      particle.arHoleTick = 0;
      particle.resetedRadius = false;
      particle.d = random(0, 360);
      particle.r = random(min_radius, max_radius);
      particle.roate();
      particle.calcSpeed();
      particle.alphaEnd = particle.calcAlpha(false);
      particle.alpha = 0;
      particle.alphaTrans = true;
      particle.alphaTransSpeed = alpha_trans_speed;
    }
  }
  buildExplodeParticles() : void {
    const particles = this.particles;
    const height = this.height;
    let particle: Particle|null = null;
    let dt = 0;

    for (let i = 0; i < max_particles; i++) {
      particle = particles[i];
      particle.positionArrived = false;
      particle.positionLast.set(particle.position);
      particle.positionTransStart.set(particle.position);

      dt = particle.getD() + 90;
      if(dt >= 360) dt = dt - 360;

      //x*x0+y*y0=r^2

      particle.positionTransTarget.y = height + 40;
      particle.positionTransTarget.x = (Math.pow(particle.r, 2) - height * particle.positionTransStart.y) / particle.positionTransStart.x;//yb
      particle.lt = Math.sqrt(Math.pow(particle.positionTransTarget.x, 2) + Math.pow(particle.positionTransTarget.y, 2));

      particle.speed = min_explode_speed + 
        ((Math.sqrt(Math.pow(particle.positionTransStart.x, 2) + Math.pow(particle.positionTransStart.y, 2)) - min_radius) / 
        (max_radius - min_radius)) * (max_explode_speed - min_explode_speed);
        
      particle.mst = particle.speed * Math.sin(dt * Math.PI / 180);
    }
  }
  buildExplodeQuadrantParticles() : void {
    const particles = this.particles;
    const height = this.height;
    const width = this.width;
    let particle: Particle|null = null;

    for (let i = 0; i < max_particles; i++) {
      particle = particles[i];
      particle.positionArrived = false;
      particle.positionLast.set(particle.position);
      particle.positionTransStart.set(particle.position);

      if(particle.position.y < 0){

        if(particle.position.x < 0){//3
          particle.positionTransTarget.x = width + 40;
          particle.positionTransTarget.y = (Math.pow(particle.r,2) - (width) * particle.position.x) / particle.position.y;//xr
          particle.fType = 'x';
        }else{//4
          particle.positionTransTarget.y = height + 40;
          particle.positionTransTarget.x = (Math.pow(particle.r, 2) - height * particle.position.y) / particle.position.x;//yb
          particle.fType = 'y';
        }
      }else{
        if(particle.position.x < 0){//2
          particle.positionTransTarget.y = - height - 40;
          particle.positionTransTarget.x = (Math.pow(particle.r,2) - (- height) * particle.position.y) / particle.position.x;//yt
          particle.fType = 'y';
        }else{//1
          particle.positionTransTarget.x = -width - 40;
          particle.positionTransTarget.y = (Math.pow(particle.r,2) - (-width) * particle.position.x) / particle.position.y;//xl
          particle.fType = 'x';
        }
        
      }
    
      particle.speed = min_speed + (particle.r / max_radius) * (max_speed - min_speed);
      
      if (particle.speed < min_speed) particle.speed = min_speed;
      if (particle.speed > max_speed) particle.speed = max_speed;

      particle.speed = particle.speed * 20;
    }
  }
  buildExplode2Particles() : void {
    const particles = this.particles;
    const height = this.height;

    let particle: Particle|null = null;
    for (let i = 0; i < max_particles; i++) {
      particle = particles[i];
      particle.positionArrived = false;
      particle.positionLast.set(particle.position);
      particle.positionTransStart.set(particle.position);

      if(particle.d >= 0 && particle.d < 180) {
        particle.positionTransTarget.y = height + 40;
        particle.positionTransTarget.x = (Math.pow(particle.r, 2) - height * particle.position.y) / particle.position.x;//yb
        particle.fType = 'y';
      } else if(particle.d >= 180 && particle.d < 360) {
        particle.positionTransTarget.y = - height - 40;
        particle.positionTransTarget.x = (Math.pow(particle.r,2) - (- height) * particle.position.y) / particle.position.x;//yt
        particle.fType = 'y';
      }

      particle.speed = min_speed + (particle.r / max_radius) * (max_speed - min_speed);
      
      if (particle.speed < min_speed) particle.speed = min_speed;
      if (particle.speed > max_speed) particle.speed = max_speed;
    
      particle.speed = particle.speed * 20;
    }
  }
  buildSpectrumParticlesEnd() : void {
    const w = spectrum_width;
    const h = spectrum_height;
    const dsp = 360 / w;

    let particle: Particle|null = null;
    let d = 0;
    let i = 0;
    let hi = 0;

    while(i < max_particles) {

      if(hi < h - 1) hi++;
      else {
        hi = 0;
        d += dsp;
      }

      particle = this.particles[i];
      particle.positionArrived = false;
      particle.positionTransStart.set(particle.position);
      particle.speed = 0.02;
      particle.r = (spectrum_min_h + hi * (spectrum_spacing + 3));
      particle.d = d;
      particle.positionTransTarget.x = particle.r * Math.cos(d * Math.PI / 180);
      particle.positionTransTarget.x = particle.r * Math.sin(d * Math.PI / 180);
      particle.alphaTrans = true;
      particle.alphaEnd = 1;
      particle.alphaTransSpeed = 0.2;

      
      i++;
    }
  }
  buildSpectrumParticlesStart() : void {
    const particles = this.particles;

    let particle: Particle|null = null;
    for (let i = 0; i < max_particles; i++) {
      particle = particles[i];
      particle.alphaTrans = true;
      particle.alphaTransSpeed = 0.05;
      particle.alphaEnd = 0;
    }
  }
  buildLoveParticles() : void {
    
    const center = max_particles/10;
    const particles = this.particles
    const max = 1.14;
    const step = max*2 / center;

    let y = 0;
    let index = 0;
    let x = 0;
  
    for(x = 0; x <= max && index < max_particles; x += step) {
      y = (Math.pow(x,(2/3))+Math.sqrt(Math.pow(x,(4/3))-4*Math.pow(x,2)+4))/2;
      particles[index].positionTransTarget.x = x;
      particles[index].positionTransTarget.y = y;
      particles[index].alpha = x / max;
      particles[index+1].positionTransTarget.x = -x;
      particles[index+1].positionTransTarget.y = y;
      particles[index+1].alpha = x / max;
      index+=2;
    }
  
    for(x = 0; x <= max && index < max_particles; x += step) {
      y = (Math.pow(x,(2/3))-Math.sqrt(Math.pow(x,(4/3))-4*Math.pow(x,2)+4))/2;
      particles[index].positionTransTarget.x = x;
      particles[index].positionTransTarget.y = y;
      particles[index].alpha = x / max;
      particles[index+1].positionTransTarget.x = -x;
      particles[index+1].positionTransTarget.y = y;
      particles[index+1].alpha = x / max;
      index+=2;
    }
    const lim = index;
    index = 0;
    for(; index < lim; index++) {
      particles[index].positionTransTarget.x *= 150;
      particles[index].positionTransTarget.y *= 130;
      particles[index].positionArrived = false;
      particles[index].speed = max_speed * 3;
      particles[index].isLove = true;
    }
    for(; index < max_particles; index++) {
      particles[index].d = random(0, 360);
      particles[index].r = random(min_radius, max_radius);
      particles[index].calcPos();
      particles[index].positionTransTarget.set(particles[index].position);
      particles[index].speed = min_speed;
      particles[index].alpha = 0;
      particles[index].loveAlphaMax = particles[index].calcAlpha() * Math.random();
      particles[index].alphaEnd = particles[index].loveAlphaMax;
      particles[index].alphaTrans = true;
      particles[index].isLove = false;
    }
  }
  buildWaveParticles() : void {

    const wave_row_count = 40;
    const particles = this.particles;
    const height = this.height;
    const width = this.width;
    const wave_line_count = Math.floor(max_particles / wave_row_count); 

    const line_height = height / wave_row_count;
    const line_width = width / wave_line_count;
    const sin_x_ince = Math.PI * 7 / wave_line_count; 

    let sin_x = 0;

    let index = 0;
    let particle : Particle|null = null;

    const w2 = width / 2;
    const h2 = height / 2;
    let sp = 0;

    for(let i = 0; i < wave_row_count; i++) {

      sin_x = i * Math.PI / 8;
      sp =  0.01 + 0.8 * (1 - Math.abs((i / 2) - i) / (i / 2));

      for(let j = 0; j < wave_line_count && index < max_particles; j++) {

        particle = particles[index];
        particle.positionArrived = true;
        particle.position.x = line_width * j - w2;
        particle.waveOn = true;
        particle.position.y = (line_height * 0.8) * Math.sin(sin_x) + line_height * i - h2;
        particle.waveData = {
          xStart: sin_x,
          x: sin_x,
          yStart: particle.position.y,
          height: (line_height * 0.8),
          offest: line_height * i - h2,
        };
        particle.speed = max_speed * 10;
        particle.alpha = 0;
        particle.alphaTrans = true;
        particle.alphaEnd = ((h2 - Math.abs(particle.position.y)) / h2);

        particle.waveTransSpeed = sp;
        //particle.waveTransSpeed = 0.01 + 0.1 * ((h2 - Math.abs(particle.position.y)) / h2);

        sin_x += sin_x_ince;
        index++;
      }
    }

    if(particle) {
      for(;index < max_particles;index++) {
        particle.waveOn = false;
        particle = particles[index];
        particle.alpha = 0;
      }
    }
  }



}

function create_shader(gl : WebGLRenderingContext, str : string, type : string) {
  let shader : WebGLShader; 
  switch (type) {
    case 'x-shader/x-vertex':
      shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader; //生成顶点着色器
      break; 
    case 'x-shader/x-fragment':
      shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader; //生成片元着色器
      break;
    default:
      return;
  }

  //编译着色器
  gl.shaderSource(shader, str); 
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    return shader;
  else {
    // 编译失败，弹出错误消息
    alert(gl.getShaderInfoLog(shader));
    console.error(gl.getShaderInfoLog(shader));
  }
}
function create_program(gl : WebGLRenderingContext, vs : WebGLShader, fs : WebGLShader) {
  const program = gl.createProgram(); //向程序对象里分配着色器

  if(!program) {
    alert('Failed to create program!');
    return;
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  
  //将着色器连接
  gl.linkProgram(program); 
  
  //判断着色器的连接是否成功
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(program); 
    return program;
  } else {
    // 如果失败，弹出错误信息
    alert(gl.getProgramInfoLog(program));
    console.error(gl.getShaderInfoLog(program));
  }
}