<template>
  <div v-if="player" class="imengyu-game-contol">
    <div v-show="open">
      <slot />
    </div>
    <div class="mt-3">
      <slot name="sw" />
      <input ref="musicInputFile" class="display-none" @change="onMusicInputFile" id="file" type="file" accept="audio/*" />
      <div v-show="open" class="imengyu-music-control">

        <button v-show="!player.audioOpened" class="imengyu-icon-button" title="播放音乐" @click="onOpenMusicClick">
          <i class="iconfont icon-yinle"></i>
        </button>
        <button v-show="player.audioOpened" @click="player.stopMusic()" class="imengyu-icon-button" title="停止音乐"><i class="iconfont icon-stop"></i></button>
        <button v-show="player.audioOpened && player.status == 'paused'" @click="player.play()" class="imengyu-icon-button" title="播放音乐"><i class="iconfont icon-play"></i></button>
        <button v-show="player.audioOpened && player.status == 'playing'" @click="player.pause()" class="imengyu-icon-button" title="暂停音乐"><i class="iconfont icon-pause"></i></button>
        
        <div class="position-relative">
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
        <div v-show="player.audioOpened">
          <input ref="musicTrack" type="range" min="0" :value="player.playtime" :max="player.audioDurtion" class="sl"
            @mousedown="player.trackStart()" @mouseup="player.trackEnd($refs.musicTrack.value)"
            :style="'background:linear-gradient(to right, #000, #000 ' + 
            (player.playProgress*100) + '%, #cecece ' + (Math.floor((player.playProgress*100)) + 1) + '%, #cecece)'" />
          <span>{{ player.playtimeString }}</span>
        </div>
        <span>{{ player.audioCurrentName }}</span>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { CanvasSortGame } from '../model/CanvasSortGame';
import { MusicPlayer, MusicPlayerStatus } from '../model/MusicPlayer';

@Component({
  name: 'MusicGameControll'
})
export default class MusicGameControll extends Vue {
  
  @Prop({default:null}) canvasGame: CanvasSortGame;
  @Prop({default:50}) playerVolume: number;
  @Prop({default:true}) open: boolean;

  public audioCurrentName = '';  

  player : MusicPlayer = null;
  playerUpdateSpectrumTimer = null;
  playerVolumeToolShow = false;
  playerStatus : MusicPlayerStatus = 'stopped';

  initPlayer() {
    this.player = new MusicPlayer();
    this.player.initPlayer();
    this.player.on('statuschanged', this.onPlayerStatuschanged.bind(this));
    this.player.setVolume(this.playerVolume);
    this.canvasGame.setDrawSpectrumCallback(this.onPlayerUpdateSpectrum.bind(this));
  }
  destroyPlayer() {
    this.canvasGame.setDrawSpectrumCallback(null);
    this.player.off('statuschanged', this.onPlayerStatuschanged);
    this.player.destroyPlayer();
  }
  onMusicInputFile() {
    let file = (<HTMLInputElement>this.$refs.musicInputFile).files[0];
    this.audioCurrentName = file.name;
    this.player.openMusic(file);
    (<HTMLInputElement>this.$refs.musicInputFile).value = '';
  }
  onOpenMusicClick() {
    (<HTMLInputElement>this.$refs.musicInputFile).click();
  }
  onPlayerStatuschanged(status : MusicPlayerStatus) {
    this.playerStatus = status;
    if(status == 'opened') {
      this.$emit('on-go-spectrum-mode');
    }else if(status == 'stopped') {
      clearInterval(this.playerUpdateSpectrumTimer);
      this.$emit('on-quit-spectrum-mode');
    }
  }
  onPlayerUpdateSpectrum() {
    if(this.player.audioOpened)
      this.canvasGame.drawSpectrum(this.player.analyser, this.player.voiceHeight);
  }
  onPlayerVolumeChange() {
    this.player.setVolume(parseInt((<HTMLInputElement>this.$refs.musicVolume).value));
    this.$emit('update-volume', this.player.volume);
  }

  //load

  mounted() {
    setTimeout(() => this.initPlayer(), 200)
  }
  beforeDestroy() {
    this.destroyPlayer();
  }

}
</script>