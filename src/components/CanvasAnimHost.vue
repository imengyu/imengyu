<template>
  <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
    <canvas v-show="playing" class="imengyu-canvas animated" ref="canvas"></canvas>
  </transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { CanvasGameProvider } from '../model/CanvasGameProvider'

export interface ICanvasAnimHost {
  start() : void;
  stop() : void;
  currentFpsShowVal: number,
}

export default defineComponent({
  name: 'CanvasAnimHost',
  props: {
    gameProvider: {
      type: Object as PropType<CanvasGameProvider>,
      default: null,
    },
    create2DCtx: {
      type: Boolean,
      default: true,
    },
    background: {
      type: String,
      default: '#000',
    },
  },
  data() {
    return {
      canvas: null as HTMLCanvasElement|null,
      ctx: null as CanvasRenderingContext2D|null,
      renderTickHandle: 0,
      renderLastTime: new Date(),
      currentFps: 0,
      currentFpsShowVal: '00.00',
      playing: false,
      tick: 0,
    }
  },
  mounted() {
    setTimeout(() => {
      this.canvas = this.$refs.canvas as HTMLCanvasElement;
      this.initCanvas();
       window.addEventListener('resize', this.onWindowResize);
    }, 400);
  },
  beforeUnmount() {
    this.destroyCanvas();
    window.removeEventListener('resize', this.onWindowResize);
  },
  methods: {
    onWindowResize() {
      const canvas = this.canvas;
      if(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.gameProvider.resize(canvas.width, canvas.height);
      }
    },
    renderTick() {
      const canvas = this.canvas;
      if(canvas) {
        const currentTime = new Date();
        const detiaTime = currentTime.getTime() - this.renderLastTime.getTime();

        this.currentFps = 1000 / detiaTime;
        this.renderLastTime = currentTime;

        if(this.ctx) this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.tick ++;

        if(this.tick >= 60) {
          this.tick = 0;
          this.currentFpsShowVal = this.currentFps.toFixed(2);
        }

        this.gameProvider.render(1 / this.currentFps);
        this.renderTickHandle = requestAnimationFrame(this.renderTick);
      }
    },
    initCanvas() {
      const canvas = this.canvas;
      if(canvas) {
        if(this.create2DCtx) this.ctx = canvas.getContext('2d');
        this.onWindowResize();
        this.gameProvider.init(canvas, this.ctx as CanvasRenderingContext2D);
      }
    },
    destroyCanvas() {
      this.stop();
      this.gameProvider.destroy();
    },
    start() {
      if(this.renderTickHandle != 0) this.stop();
      if(this.renderTickHandle == 0) {
        this.playing = true;
        setTimeout(() => {
          this.gameProvider.start();
          this.renderTick();
        }, 300);
      }
    },
    stop() {
      this.playing = false;
      this.gameProvider.stop();
      cancelAnimationFrame(this.renderTickHandle);
      this.renderTickHandle = 0;
    }
  }
})
</script>