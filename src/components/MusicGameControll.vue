<template>
  <div v-if="player" class="imengyu-game-contol">
    <button class="imengyu-icon-button mr-3 mt-0 open-button" :data-open="open" @click="$emit('switch-open')">
      <i class="iconfont icon-xuanzeqixiayige_o"></i>
    </button>
    <div class="box" v-show="open">
      <slot />
      <input ref="musicInputFile" class="display-none" @change="onMusicInputFile" id="file" type="file" accept="audio/*" />
      
      <div class="item imengyu-music-control mt-3">
        <span :title="player.audioOpened?('正在播放：'+audioCurrentName):''">{{ player.audioOpened?'正在播放':'' }}</span>
        <div>
          <button v-show="!player.audioOpened" class="imengyu-icon-button" title="播放音乐" @click="onOpenMusicClick">
            <i class="iconfont icon-yinle"></i>
          </button>
          <button v-show="player.audioOpened" @click="player.stopMusic()" class="imengyu-icon-button" title="停止音乐"><i class="iconfont icon-stop"></i></button>
          <button v-show="player.audioOpened && player.status == 'paused'" @click="player.play()" class="imengyu-icon-button" title="播放音乐"><i class="iconfont icon-play"></i></button>
          <button v-show="player.audioOpened && player.status == 'playing'" @click="player.pause()" class="imengyu-icon-button" title="暂停音乐"><i class="iconfont icon-pause"></i></button>
          
          <div class="position-relative display-inline-block">
            <button class="imengyu-icon-button" @click="playerVolumeToolShow=!playerVolumeToolShow" title="音量">
              <i :class="'iconfont ' + (player.volume > 0 ? 'icon-sound' : 'icon-mute')"></i>
            </button>
            <div v-show="playerVolumeToolShow" class="volume-tool light-tooltip animated zoomIn">
              <input ref="musicVolume" type="range" min="0" :value="player.volume" :max="100" class="vol"
                @input="onPlayerVolumeChange"
                @change="onPlayerVolumeChange"
                :style="'background:linear-gradient(to right, #000, #000 ' + 
                (player.volume) + '%, #cecece ' + (Math.floor((player.volume)) + 1) + '%, #cecece)'" />
              <span>{{ Math.floor(player.volume) }}%</span>
            </div>
          </div>    
        </div>   
      </div>
      <div class="item full mt-3" v-show="player.audioOpened">
        <input ref="musicTrack" type="range" min="0" :value="player.playtime" :max="player.audioDurtion" class="sl"
          @mousedown="player.trackStart()" @mouseup="player.trackEnd($refs.musicTrack.value)"
          :style="'background:linear-gradient(to right, #000, #000 ' + 
          (player.playProgress*100) + '%, #cecece ' + (Math.floor((player.playProgress*100)) + 1) + '%, #cecece)'" />
        <span>{{ player.playtimeString }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { CanvasGameProvider } from '../model/CanvasGameProvider';
import { MusicPlayer, MusicPlayerStatus } from '../model/MusicPlayer';

export default defineComponent({
  name: 'MusicGameControll',
  props: {
    canvasGames: {
      type: Object as PropType<CanvasGameProvider[]>,
      default: null,
    },
    currentCanvasGame: {
      type: Object as PropType<CanvasGameProvider>,
      default: null,
    },
    playerVolume: {
      type: Number,
      default: 50,
    },
    open: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      audioCurrentName: '',
      player: null as MusicPlayer|null,
      playerUpdateSpectrumTimer: 0,
      playerVolumeToolShow: false,
      playerStatus: 'stopped' as MusicPlayerStatus,
    }
  },
  methods: {
    initPlayer() {
      this.player = new MusicPlayer();
      this.player.initPlayer();
      this.player.on('statuschanged', this.onPlayerStatuschanged.bind(this));
      this.player.setVolume(this.playerVolume);

      this.canvasGames.forEach((g) => g.setDrawSpectrumCallback(this.onPlayerUpdateSpectrum.bind(this)));
    },
    destroyPlayer() {
      this.canvasGames.forEach((g) => g.setDrawSpectrumCallback(null));
      if(this.player) {
        this.player.off('statuschanged', this.onPlayerStatuschanged);
        this.player.destroyPlayer();
      }
    },
    onMusicInputFile() {
      const musicInputFile = (this.$refs.musicInputFile as HTMLInputElement);
      if(musicInputFile && musicInputFile.files && this.player) {
        const file = musicInputFile.files[0];
        this.audioCurrentName = file.name;
        this.player.openMusic(file);
        musicInputFile.value = '';
      }
    },
    onOpenMusicClick() {
      (this.$refs.musicInputFile as HTMLInputElement).click();
    },
    onPlayerStatuschanged(status : MusicPlayerStatus) {
      this.playerStatus = status;
      if(status == 'opened') {
        this.$emit('on-go-spectrum-mode');
      }else if(status == 'stopped') {
        clearInterval(this.playerUpdateSpectrumTimer);
        this.$emit('on-quit-spectrum-mode');
      }
    },
    onPlayerUpdateSpectrum() {
      if(this.player && this.player.audioOpened)
        this.currentCanvasGame.drawSpectrum(this.player.analyser as AnalyserNode, this.player.voiceHeight as Uint8Array);
    },
    onPlayerVolumeChange() {
      if(this.player) {
        this.player.setVolume(parseInt((this.$refs.musicVolume as HTMLInputElement).value));
        this.$emit('update-volume', this.player.volume);
      }
    }
  },
  mounted() {
    setTimeout(() => this.initPlayer(), 1000)
  },
  beforeUnmount() {
    this.destroyPlayer();
  }
})
</script>