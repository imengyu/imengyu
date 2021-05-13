<template>
  <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
    <canvas v-show="playing" class="imengyu-canvas animated" ref="canvas"></canvas>
  </transition>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { CanvasGameProvider } from '../model/CanvasGameProvider'

@Component({
  name: 'CanvasAnimHost'
})
export default class CanvasAnimHost extends Vue {
  canvas : HTMLCanvasElement;
  ctx : CanvasRenderingContext2D;

  @Prop({default:null}) gameProvider : CanvasGameProvider; 
  @Prop({default:true}) create2DCtx : boolean;
  @Prop({default:'#000'}) background : string;

  mounted() {
    setTimeout(() => {
      this.canvas = <HTMLCanvasElement>this.$refs.canvas;
      this.initCanvas();
       window.addEventListener('resize', this.onWindowResize);
    }, 400);
  }
  beforeDestroy() {
    this.destroyCanvas();
     window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
    this.canvas.width = window.outerWidth;
    this.canvas.height = window.outerHeight;
  }

  renderTickHandle = null;
  renderLastTime = new Date();
  currentFps = 0;
  currentFpsShowVal = '00.00';
  playing = false;

  tick = 0;

  renderTick() {
    var currentTime = new Date();
    var detiaTime = currentTime.getTime() - this.renderLastTime.getTime();

    this.currentFps = 1000 / detiaTime;
    this.renderLastTime = currentTime;

    if(this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.tick ++;

    if(this.tick >= 60) {
      this.tick = 0;
      this.currentFpsShowVal = this.currentFps.toFixed(2);
    }

    this.gameProvider.render(1 / this.currentFps);
    this.renderTickHandle = requestAnimationFrame(this.renderTick);
  }
  initCanvas() {
    if(this.create2DCtx) this.ctx = this.canvas.getContext('2d');
    this.onWindowResize();
    this.gameProvider.init(this.canvas, this.ctx);
  }

  destroyCanvas() {
    this.stop();
    this.gameProvider.destroy();
  }

  public start() {

    if(this.renderTickHandle != null) this.stop();
    if(this.renderTickHandle == null) {
      this.playing = true;
      setTimeout(() => {
        this.gameProvider.start();
        this.renderTick();
      }, 300);
    }
  }
  public stop() {
    this.playing = false;
    this.gameProvider.stop();
    cancelAnimationFrame(this.renderTickHandle);
    this.renderTickHandle = null;
  }

}
</script>