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
import { Component, Vue, Prop } from 'vue-property-decorator'
import { CanvasGameProvider } from '../model/CanvasGameProvider';
import { MusicPlayer, MusicPlayerStatus } from '../model/MusicPlayer';

@Component({
  name: 'MusicGameControll'
})
export default class MusicGameControll extends Vue {
  
  @Prop({default:null}) canvasGames: CanvasGameProvider[];
  @Prop({default:null}) currentCanvasGame: CanvasGameProvider;
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

    this.canvasGames.forEach((g) => g.setDrawSpectrumCallback(this.onPlayerUpdateSpectrum.bind(this)));
  }
  destroyPlayer() {
    this.canvasGames.forEach((g) => g.setDrawSpectrumCallback(null));
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
      this.currentCanvasGame.drawSpectrum(this.player.analyser, this.player.voiceHeight);
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