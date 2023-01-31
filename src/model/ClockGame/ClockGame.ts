import Utils from "@/utils/Utils";
import { CanvasGameProvider } from "../CanvasGameProvider";
import { getColorByIndex, getRandomColor } from "./colorPool";
import { getNumberTextPointMap, NUMBER_MAP_HEIGHT, NUMBER_MAP_WIDTH, NUMBER_POINT_INDEX } from "./numberPmoduls";
import { getHelloWorldTextMap } from "./starsHelloWorld";

const random = Utils.randomNum;

const max_particles = 200;
const max_particles_size = 36;
const particles_size_text = 9;
const particles_size_text_sm = 4;
const move_speed = 0.3;
const move_speed_into_text = 10;
const move_speed_into_text_min = 0.5;
const move_speed_into_time_text_nor = 10;
const move_speed_into_time_text_fast = 20;
const move_speed_into_time_text_min = 0.7;
const explode_speed = 10;
const explode_speed_min = 5;
const explode_radius = 600;
const auto_switch_mode_sec_min = 16;
const auto_switch_mode_sec_max = 26;
const auto_switch_mode_sec_min_text = 36;
const auto_switch_mode_sec_max_text = 50;
const text_sm_sp = 700;
const text_display_height = 100;
const text_display_height_sm = 65;

export type StartsMode = 'normal'|'text'|'explode'|'timer';

export function getStartsModes() : string[] {
  return [ 'normal','text','explode','timer' ]
}

export class Particle {

  x = 0;
  y = 0;
  variantx1 = 0;
  variantx2 = 0;
  varianty1 = 0;
  varianty2 = 0;
  radius = 0;
  radiusOrg = 0;
  color = '';
  progress = 0;
  alpha = 0;

  textPart = false;
  textPositionX = 0;
  textPositionY = 0;

  positionXDiff = 0;
  positionYDiff = 0;
  positionArrived = false;

  timePart = false;
  timePartIsSec = false;
  timeIsPoint = false;
  timePositionX = 0;
  timePositionY = 0;
  timePositionChanged = false;

  positionXP = 0;
  positionYP = 0;

  positionXPText = 0;
  positionYPText = 0;

  explodePositionX = 0;
  explodePositionY = 0;

  isMouseEnter = false;
  isAskItem = false;
  isInfoItem = false;
  isInfoConItem = false;

  infoItemIndex = -1;
  infoItemText = '';
  infoConItemTick = 0;

  private game : ClockGame;

  constructor(progress : number, isTextPart : boolean, game : ClockGame) {
    this.textPart = isTextPart;
    this.game = game;
    this.progress = progress;

    this.x = this.game.width / 2 + (Math.random() * 400 - Math.random() * 400);
    this.y = this.game.height / 2 + (Math.random() * 200 - Math.random() * 200);

    this.radiusOrg = isTextPart ? (this.game.width > text_sm_sp ? particles_size_text : particles_size_text_sm) : random(2, max_particles_size);
    this.radius = this.radiusOrg;
    this.color = getRandomColor();

    this.variantx1 = Math.random() * 300;
    this.variantx2 = Math.random() * 400;
    this.varianty1 = Math.random() * 100;
    this.varianty2 = Math.random() * 120;
  }


  render() : void {
    if(this.alpha == 0) return;

    const ctx = this.game.ctx;
    if(ctx) {
      //绘制圆
      ctx.globalAlpha = this.alpha;
      ctx.lineWidth = this.radius;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      
      if(this.game.show_box) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#f00';
        ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
      }

      if(this.isMouseEnter && this.isAskItem) this.renderTextInCenter('?');
      else if(this.isMouseEnter && this.game.mode == 'normal' && this.isInfoItem)this.renderTextInCenter(this.infoItemText, true);
      else if(this.isInfoConItem) this.renderTextInCenter(this.infoItemText, true, true, 'big');

      if(this.game.show_pos) this.renderTextPos();
    }
  }
  renderTextPos() : void {
    //Render pos text
    if(this.game.mode == 'text') this.renderTextInCenter(this.positionXPText+','+this.positionYPText);
    
    const ctx = this.game.ctx;
    if(ctx) {
      ctx.fillStyle = '#fff';
      if(this.isMouseEnter) ctx.fillText(
        this.positionXP+','+this.positionYP + '[' + Math.floor(this.x)+','+Math.floor(this.y) + ']', 
        this.x - this.radius, this.y - this.radius);
      else if(this.game.mode == 'timer') this.renderTextInCenter(this.positionXP+','+this.positionYP);
      else this.renderTextInCenter(Math.floor(this.x)+','+Math.floor(this.y));
    }
  }
  renderTextInCenter(str : string, limitWidth = false, warpText = false, textSize : 'small'|'big' = 'small') : void {
    const ctx = this.game.ctx;
    if(ctx) {
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = textSize == 'big' ? '17px Arial' : '11px Arial';
      if(warpText && limitWidth) {
        const padding = 5;
        let lineWidth = 0, initHeight = this.y - padding, lastSubStrIndex = 0;
        for(let i=0;i<str.length;i++){ 
          lineWidth += ctx.measureText(str[i]).width; 
          if(lineWidth > this.radius * 2 - padding * 4){  
              ctx.fillText(str.substring(lastSubStrIndex,i), this.x + padding, initHeight);//绘制截取部分
              initHeight += 16;//20为字体的高度
              lineWidth=0;
              lastSubStrIndex=i;
          } 
          if(i==str.length-1){//绘制剩余部分
            ctx.fillText(str.substring(lastSubStrIndex,i+1), this.x + padding, initHeight);
          }
        }
      }else ctx.fillText(str, this.x, this.y, limitWidth ? this.radius * 2 : undefined);
    }
  }
  resetPos() : void {
    this.alpha = 0;
    this.x = this.game.width / 2 + (Math.random() * 400 - Math.random() * 400);
    this.y = this.game.height / 2 + (Math.random() * 200 - Math.random() * 200);
  }
  fastHidden() : void {
    if(this.alpha > 0.05) this.alpha -= 0.05;
    else if(this.alpha != 0) this.alpha = 0;
  }
  moveCloseToPos(tx : number, ty : number, speed : number, speedMin : number) : void {
    if(!this.positionArrived) {

      const xDiff = Math.abs(this.x - tx);
      const yDiff = Math.abs(this.y - ty);

      if(xDiff < 0.5 && yDiff < 0.5) {
        this.positionArrived = true;
        return;
      }

      let xDiffPec = this.positionXDiff > 0 ? 
        Math.abs(this.x - tx) / this.positionXDiff : 0;
      let yDiffPec = this.positionYDiff > 0 ? 
        Math.abs(this.y - ty) / this.positionYDiff : 0;

      if(xDiffPec > 1) xDiffPec = 1; if(yDiffPec > 1) yDiffPec = 1;

      let xSpeed = speed * xDiffPec;
      let ySpeed = speed * yDiffPec;  

      if(xSpeed > xDiff) xSpeed = speedMin;
      if(ySpeed > yDiff) ySpeed = speedMin;

      if(xSpeed < speedMin) xSpeed = speedMin;
      if(ySpeed < speedMin) ySpeed = speedMin;

      if(this.x < tx) this.x += xSpeed;
      else if(this.x > tx) this.x -= xSpeed;

      if(this.y < ty) this.y += ySpeed;
      else if(this.y > ty) this.y -= ySpeed;
    }
  }
  move() : boolean {

    let catchable = false;

    if(this.game.mode == 'text') {
      if(this.textPart) {
        if(this.alpha < 0.9)  this.alpha += 0.01;
        this.moveCloseToPos(this.textPositionX, this.textPositionY, 
          move_speed_into_text, move_speed_into_text_min);
        catchable = true;
      } else this.fastHidden()
    } else if(this.game.mode == 'explode') {
      this.fastHidden()
      this.moveCloseToPos(this.explodePositionX, this.explodePositionY, 
        explode_speed, explode_speed_min);
    } else if(this.game.mode == 'normal') {
      //this.x += (Math.sin(this.progress/this.variantx1)*Math.cos(this.progress/this.variantx2));
      //this.y += (Math.sin(this.progress/this.varianty1)*Math.cos(this.progress/this.varianty2));
      this.x += Math.sin(this.progress / this.variantx1) * Math.cos(this.progress / this.variantx2) * move_speed;
      this.y += Math.cos(this.progress / this.varianty2) * move_speed;

      if(this.alpha < (this.textPart || this.isInfoConItem ? 0.9 : 0.6)) this.alpha += 0.01;
      if ((this.x < 0 || this.x > this.game.width - this.radius) || (this.y < 0 || this.y > this.game.height - this.radius)) {
        if(this.alpha > 0.1) this.alpha -= 0.1;
        else this.resetPos();
      } else catchable = true;
    } else if(this.game.mode == 'timer') {

      if(this.timePart || this.timeIsPoint) {

        if(this.timeIsPoint) {
          //时钟的两个点
          if(this.game.clockPointShow) {
            if(this.alpha < 1) this.alpha += 0.05;
            else this.alpha = 1;
          } else {
            if(this.alpha > 0.05) this.alpha -= 0.05;
            else this.alpha = 0;
          }
        } else {
          if(this.alpha < 1) this.alpha += 0.1;
          else if(this.alpha != 1) this.alpha = 1;
        }

        this.moveCloseToPos(this.timePositionX, this.timePositionY, 
          this.timePartIsSec ? move_speed_into_time_text_fast : move_speed_into_time_text_nor, 
          move_speed_into_time_text_min);

        catchable = true;

      } else this.fastHidden()
    }

    //Enter size
    if(catchable && this.game.mouse_downed) this.radius = this.radiusOrg
    else if(catchable && this.isMouseEnter) {
      if(this.radius < this.radiusOrg * 1.3)  this.radius += 0.8;
    } else {
      if(this.radius > this.radiusOrg) this.radius -= 0.8;
      else if(this.radius != this.radiusOrg) this.radius = this.radiusOrg;
    }

    //Info conitem
    if(this.isInfoConItem && this.infoConItemTick > 1500) this.fastHidden();
  

    this.infoConItemTick++;
    this.progress++;
    this.render();

    return true;
  }
  testMouseInRect(x : number, y : number) : boolean {
    this.isMouseEnter = (x > this.x - this.radius && y > this.y - this.radius 
      && x < this.x + this.radius && y < this.y + this.radius);
    return this.isMouseEnter;
  }

  onMouseDown() : void {
    //
  }
  onMouseUp() : void {
    //创建文字粒子
    if(this.game.mode == 'normal' && this.isInfoItem) {

      this.game.autoSwitcherTimerRest();

      const p = new Particle(0, false, this.game);
      p.color = getRandomColor();
      p.isInfoConItem = true;
      p.radius = random(70, 130);
      p.radiusOrg = p.radius;
      p.infoItemText = this.game.openedinfo_particles_count < this.game.info_particles_texts.length - 1 ? 
      this.game.info_particles_texts[this.game.openedinfo_particles_count] : '没有更多信息了';

        this.game.openedinfo_particles_count++;
      this.game.particles.push(p);
      this.isInfoItem = false;
    }
  }

}

export class ClockGame extends CanvasGameProvider {

  show_pos = false;
  show_box = false;
  auto_switch = true;
  info_particles_count = 15;
  info_particles_texts : Array<string> = [];
  question_particles_count = 30;
  
  public setStarsConf(name : string, val : boolean|number|string[]) : void {
    switch(name) {
      case 'info_particles_count': this.info_particles_count = val as number; break;
      case 'question_particles_count': this.question_particles_count = val as number; break;
      case 'info_particles_texts': this.info_particles_texts = val as string[]; break;
      case 'auto_switch': 
      this.auto_switch = val as boolean; 
        if(val && this.auto_explode_timer == 0) this.autoSwitcherTimerRest();
        else if(this.auto_explode_timer != 0) this.autoSwitcherTimerRest();
        break;
      case 'show_pos': this.show_pos = val as boolean; break;
      case 'show_box': this.show_box = val as boolean; break;
    }
  
  }

  deltatime = 0;

  openedinfo_particles_count = 0;
  first_text_mode = true;
  anim_running = false;
  stars : HTMLCanvasElement|null = null;
  width = 0;
  height = 0;
  ctx : CanvasRenderingContext2D|null = null;
  particles : Array<Particle> = [];
  mode : StartsMode = 'normal';
  auto_explode_timer = 0;
  time_update_timer = 0;
  clockPointShow = false;
  onModeChangedCallback : ((mode : StartsMode) => void) | null = null;

  public setStarsTimerForUpdate() : void {
    this.build_all_time_particles();
  }
  public setStarsMode(newMode : StartsMode) : void {
    if(this.mode != newMode){
      this.mode = newMode;
      if(this.onModeChangedCallback != null) this.onModeChangedCallback(newMode);
      this.autoSwitcherMode();
  
      switch(this.mode) {
        case 'normal': this.into_normal_mode(); break;
        case 'text': this.into_text_mode(); break;
        case 'timer': 
          this.into_text_mode(); 
          this.build_all_time_particles();
          break;
        case 'explode': this.into_explode_mode(); break;
      }
    }
  }
  public setStarsModeChangedCallback(fn : (mode : StartsMode) => void) : void {
    this.onModeChangedCallback = fn;
  }
  public getStarsMode() : StartsMode {
    return this.mode;
  }
  public getStarsTextMode() : boolean {
    return this.mode == 'text';
  }


  public resize(w : number, h: number) : void {
    this.width = w;
    this.height = h;
    this.resize_rest_particles();
  }
  public init(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) : void {
    super.init(canvas, ctx)

    this.onWindowResize = this.onWindowResize.bind(this);
    this.onWindowMouseMove = this.onWindowMouseMove.bind(this);
    this.onWindowMouseDown = this.onWindowMouseDown.bind(this);
    this.onWindowMouseUp = this.onWindowMouseUp.bind(this);
    this.timerTimeUpdate = this.timerTimeUpdate.bind(this);

    this.width = canvas.width;
    this.height = canvas.height;
    this.particles = [];

    this.initEvents();
    this.initMouseMoveTimer();
    this.build_all_particles();
    this.resize_rest_particles();
  }
  public destroy() : void {
    this.clearFrame();
    this.clearMouseMoveTimer();
    this.removeEvents();

    this.particles = [];
  }
  public render(deltatime : number) : void {
    this.deltatime = deltatime;
    this.update();
  }
  public start() : void {
    if(this.anim_running) return;

    this.anim_running = true;

    this.setStarsMode('timer')
  }
  public stop() : void {
    if(!this.anim_running) return;

    this.anim_running = false;
  }

  private lastTimeString = '';
  private timerTimeUpdate() : void {
    const nowTimeString = new Date().format('HH:ii:ss');
    if(nowTimeString != this.lastTimeString) {
      this.lastTimeString = nowTimeString;
      this.setStarsTimerForUpdate();
      this.clockPointShow = !this.clockPointShow;
    }
  } 
  autoSwitcherTimerRest() : void {
    if(this.auto_explode_timer != 0) {
      clearTimeout(this.auto_explode_timer);
      this.auto_explode_timer = 0;
    }
  }
  private autoSwitcherMode() : void {
  
    //Claer running timer
    this.autoSwitcherTimerRest();
  
    //自动切换
    if(this.auto_switch) {
      if(this.mode == 'normal') {
        this.auto_explode_timer = setTimeout(() => {
          this.auto_explode_timer = 0;
          if(this.first_text_mode) this.setStarsMode('text');
          else Math.random() > 0.7 ? this.setStarsMode('timer') : this.setStarsMode('text');
        }, random(auto_switch_mode_sec_min, auto_switch_mode_sec_max) * 1000);
      }else if(this.mode == 'text') {
        this.auto_explode_timer = setTimeout(() => {
          this.auto_explode_timer = 0;
          if(this.first_text_mode) { this.first_text_mode = false; this.setStarsMode('timer'); } 
          else Math.random() > 0.7 ? this.setStarsMode('timer') : this.setStarsMode('explode');
        }, random(auto_switch_mode_sec_min_text, auto_switch_mode_sec_max_text) * 1000);
      }else if(this.mode == 'explode') {
        this.auto_explode_timer = setTimeout(() => {
          this.particles.forEach(element => element.resetPos());
          this.auto_explode_timer = 0;
          this.setStarsMode('normal');
        }, 3000);
      }
    }
  
    //Timer mode start and stop
    if(this.mode != 'timer') {
      if(this.time_update_timer != 0) {
        clearInterval(this.time_update_timer);
        this.time_update_timer = 0;
      }
    }else {
      this.resize_rest_particles();
      this.setStarsTimerForUpdate();
      this.time_update_timer = setInterval(this.timerTimeUpdate, 100);
    }
  }
  
    
  // base functions

  private clearFrame() {
    if(this.ctx) {
      //ctx.globalAlpha = 0.05;
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.width, this.height);
      //ctx.globalAlpha = 1;
    }
  }
  private update() {
    this.clearFrame();
    this.particles.forEach(p => p.move());
  }
  private getMapDisplaySize(twoLine = false) {
    return twoLine ?
      [ this.width <= text_sm_sp ? this.width * 0.9: this.width * 0.8, this.width <= text_sm_sp ? text_display_height_sm : text_display_height ] :
      [ this.width <= text_sm_sp ? this.width * 0.95: this.width * 0.8, this.width <= text_sm_sp ? text_display_height_sm : text_display_height ];
  }

  // Mouse move

  mouse_move_timer = 0;
  mouse_move_last_pos = [ 0,0 ];
  mouse_moved = false;
  mouse_downed = false;
  mouse_action : 'move'|'down'|'up'|'none' = 'none';

  private initMouseMoveTimer() {
    this.mouse_move_timer = setInterval(() => {
      if(this.mouse_moved) {
        this.mouse_moved = false;
        const x = this.mouse_move_last_pos[0];
        const y = this.mouse_move_last_pos[1];
        this.particles.forEach(e => {
          if(this.mouse_action=='up' && e.isMouseEnter) e.onMouseUp(); e.testMouseInRect(x, y)
          if(this.mouse_action=='down' && e.isMouseEnter) e.onMouseDown();
        });
      }
    }, 200);
  }
  private clearMouseMoveTimer() {
    clearInterval(this.mouse_move_timer);
  }
  private handleMouseMove(x : number, y : number, act : 'move'|'down'|'up' = 'move') {
    this.mouse_move_last_pos[0] = x;
    this.mouse_move_last_pos[1] = y;
    this.mouse_moved = true;
    this.mouse_action = act;
  }


  // particles control

  private build_all_particles() {
    let p : Particle|null = null;
    const textMapData = getHelloWorldTextMap();
    const textPosArr = textMapData.pmap;
    const textSize = this.getMapDisplaySize(true);
    const textStartPos = [ (this.width - textSize[0]) / 2, (this.height - textSize[1] - (this.width <= text_sm_sp ? (this.height / 8 + text_display_height_sm) : this.height / 8)) / 2 ];
    const textBlockSize = [ textSize[0] / textMapData.width, textSize[1] / textMapData.height ];

    let colorIndex = 0;

    if(this.width <= text_sm_sp) {
      textSize[0] = textSize[0] * 2;
      textBlockSize[0] = textSize[0] / textMapData.width;
    }

    //gen particles info range
    const askStart = random(30, 50);
    const askEnd = random(60, max_particles);
    const infoIndex = [];
    const askIndex = [];

    for (let i = 0; i < this.question_particles_count; i++) askIndex.push(random(askStart, askEnd));
    for (let i = 0; i < this.info_particles_count; i++) infoIndex.push(random(askStart, askEnd));

    //gen particles
    for (let i = 0; i < max_particles; i++) {

      p = new Particle(i, i < textPosArr.length, this);

      p.isAskItem = askIndex.indexOf(i) > -1;
      p.infoItemIndex = infoIndex.indexOf(i);
      p.infoItemText = '?';
      p.isInfoItem = p.infoItemIndex > -1;

      if(p.isInfoItem && p.radius < (this.width < text_sm_sp ? particles_size_text_sm : particles_size_text))
        p.radius = (this.width < text_sm_sp ? particles_size_text_sm : particles_size_text);

      if(i % 8 == 0) colorIndex++;
      if(i < textPosArr.length) {
        p.textPart = true;
        p.color = getColorByIndex(colorIndex);
        p.positionXPText = textPosArr[i][0];
        p.positionYPText = textPosArr[i][1];
        if(this.width > text_sm_sp) { //lg
          p.textPositionX = textStartPos[0] + textPosArr[i][0] * textBlockSize[0];
          p.textPositionY = textStartPos[1] + textPosArr[i][1] * textBlockSize[1];
        }else { //sm
          if(i < textMapData.splitIndex) { //line 1
            p.textPositionX = textStartPos[0] + textBlockSize[0] / 2 + textPosArr[i][0] * textBlockSize[0];
            p.textPositionY = textStartPos[1] + textPosArr[i][1] * textBlockSize[1];
          }else { //line 2
            p.textPositionX = textStartPos[0] + textPosArr[i][0] * textBlockSize[0] - textSize[0] / 2;
            p.textPositionY = textStartPos[1] + textSize[1] + 10 + textPosArr[i][1] * textBlockSize[1];
          }
        }
      }

      this.particles.push(p)
    }
  }

  lastP = [ 10, 10, 0, 10, 10, 0, 10, 10 ];

  private build_all_time_particles() {

    const now = new Date();

    const min = now.getMinutes();
    const hour = now.getHours();
    const second = now.getSeconds();

    //计算
    const nowP = [ 
      Math.floor(hour / 10  % 10),  
      Math.floor(hour % 10), 
      NUMBER_POINT_INDEX, 
      Math.floor(min / 10  % 10),  
      Math.floor(min % 10),
      NUMBER_POINT_INDEX, 
      Math.floor(second / 10  % 10),  
      Math.floor(second % 10),
    ];

    const textW = nowP.length * NUMBER_MAP_WIDTH;
    const textH = NUMBER_MAP_HEIGHT;

    let p : Particle|null = null;

    //计算粒子所占空间大小
    const textSize = this.getMapDisplaySize();
    const textStartPos = [ (this.width - textSize[0]) / 2, (this.height - textSize[1] - this.height / 8) / 2 ];
    const textBlockSize = [ textSize[0] / textW, textSize[1] / textH ];

    //重置标志位
    for (let index = 0; index < this.particles.length; index++) {
      const p = this.particles[index];
      p.timeIsPoint = false;
      p.timePart = false;
      p.timePartIsSec = false;
    }

    let j = 0;
    const c = this.particles.length;

    for (let i = 0; i < nowP.length; i++) { 

      //获取每个字点阵图
      const textMapData = getNumberTextPointMap(nowP[i]);

      for (let k = 0, d = textMapData.length; k < d && j < c; k++) {
        
        p = this.particles[j];j++;

        if(nowP[i] == NUMBER_POINT_INDEX) p.timeIsPoint = true;
        else p.timePart = true;
        
        p.timePartIsSec = i >= 6;

        const x = textStartPos[0] + (textMapData[k][0] + i * NUMBER_MAP_WIDTH) * textBlockSize[0];
        const y = textStartPos[1] + textMapData[k][1] * textBlockSize[1];

        if(this.lastP[i] != nowP[i] || nowP[i] == NUMBER_POINT_INDEX){//更新不一样的字

          //粒子重p置
          p.positionArrived = true;
          p.x = p.timePositionX;
          p.y = p.timePositionY;

          //设置粒子位置
          p.positionXP = (textMapData[k][0] + i * NUMBER_MAP_WIDTH);
          p.positionYP = (textMapData[k][1]);

          if(Math.abs(p.timePositionX - x) > 300 || Math.abs(p.timePositionY - y) > 110){ //太远，直接移动s
            p.alpha = 0;
            p.x = x;
            p.y = y;
          }

          if(p.timePositionX != x || p.timePositionY != y) {

            p.timePositionX = x;
            p.timePositionY = y;

            p.positionArrived = false;
            p.positionXDiff = Math.abs(p.x - p.timePositionX);
            p.positionYDiff = Math.abs(p.y - p.timePositionY);
            if(p.positionXDiff > move_speed_into_time_text_min && p.positionXDiff < 10) 
              p.positionXDiff = 10;
            if(p.positionYDiff > move_speed_into_time_text_min && p.positionYDiff < 10) 
              p.positionYDiff = 10;
          }
        }
      }
    }

    this.lastP = nowP;
  }

  //Mode init
  private into_explode_mode() {  
    this.particles.forEach(element => {
      element.positionArrived = false;
      element.explodePositionX = this.width / 2 + explode_radius * Math.cos(Math.random() * 360);
      element.explodePositionY = this.height / 2 + explode_radius * Math.cos(Math.random() * 360);

      element.positionXDiff = Math.abs(element.x - element.explodePositionX);
      element.positionYDiff = Math.abs(element.y - element.explodePositionY);

      if(element.positionXDiff < 2) element.positionXDiff = 10;
      if(element.positionYDiff < 2) element.positionYDiff = 10;
    });
  }
  private into_text_mode() {
    this.particles.forEach(element => {
      element.positionArrived = false;
      element.positionXDiff = Math.abs(element.x - element.textPositionX);
      element.positionYDiff = Math.abs(element.y - element.textPositionY);

      if(element.positionXDiff < 2) element.positionXDiff = 10;
      if(element.positionYDiff < 2) element.positionYDiff = 10;
    });
  }
  private into_normal_mode() {
    this.particles.forEach(element => element.resetPos());
  }
  private resize_rest_particles() {
    this.resize_dely_timer = 0;
    this.lastP = [ 10, 10, 0, 10, 10, 0, 10, 10 ];
    if(this.particles)
      this.particles.forEach(p => p.resetPos());
  }

  // Evevnt

  private initEvents() {
    window.addEventListener('resize', this.onWindowResize);
    document.body.addEventListener('mousemove', this.onWindowMouseMove);
    document.body.addEventListener('mousedown', this.onWindowMouseDown);
    document.body.addEventListener('mouseup', this.onWindowMouseUp);
  }
  private removeEvents() {
    window.removeEventListener('resize', this.onWindowResize);
    document.body.removeEventListener('mousemove', this.onWindowMouseMove);
    document.body.removeEventListener('mousedown', this.onWindowMouseDown);
    document.body.removeEventListener('mouseup', this.onWindowMouseUp);
  }

  // Evevnt handler
  //

  resize_dely_timer = 0;

  private onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if(this.ctx) {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    if(this.resize_dely_timer == 0)
    this.resize_dely_timer = setTimeout(this.resize_rest_particles, 1100);
  }
  private onWindowMouseMove(e : MouseEvent) {
    this.handleMouseMove(e.pageX, e.pageY);
  }
  private onWindowMouseDown(e : MouseEvent) {
    this.handleMouseMove(e.pageX, e.pageY, 'down');
    this.mouse_downed = true;
  }
  private onWindowMouseUp(e : MouseEvent) {
    this.handleMouseMove(e.pageX, e.pageY, 'up');
    this.mouse_downed = false;
  }
}