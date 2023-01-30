import { EventEmitter } from '../utils/EventEmitter';
import { getTimeStringSec } from '../utils/Utils'


export type MusicPlayerStatus = 'stopped'|'opened'|'paused'|'playing'; 

//=============================
// Player 
//=============================

export class MusicPlayer extends EventEmitter {

  public constructor() {
    super();
  }

  public audio : HTMLAudioElement|null = null;
  public audioTracking = false;
  public audioDurtion = 0;
  public audioDurtionString = '';
  public status : MusicPlayerStatus = 'stopped';
  public analyser : AnalyserNode|null  = null;
  public volume = 100;
  public voiceHeight : Uint8Array|null = null;
  public audioWaveCount = 128;
  public audioOpened = false;

  private oCtx : AudioContext|null = null;
  private audioTimer = 0;
  private audioSrc : MediaElementAudioSourceNode|null = null;
  private audioFading = false;
  private audioFadeInterval = 0;

  initPlayer() : void {

    this.audio = document.createElement('audio');
    this.audio.autoplay = false;
    this.audio.onended = this.onPlayerEnded.bind(this);
    this.audio.onpause = this.onPlayerPause.bind(this);
    this.audio.onplay = this.onPlayerPlay.bind(this);
    this.audio.oncanplay = this.onPlayerCanPlay.bind(this);

    document.body.appendChild(this.audio);
  }
  initContext() : void {
    this.oCtx = new AudioContext();
    this.audioSrc = this.oCtx.createMediaElementSource(this.audio as HTMLAudioElement);
    this.analyser = this.oCtx.createAnalyser();

    this.audioSrc.connect(this.analyser);
    this.analyser.connect(this.oCtx.destination);

    this.voiceHeight = new Uint8Array(this.analyser.frequencyBinCount);
  }
  destroyPlayer() : void {

    if(this.audio) {
      this.audio.onended = null;
      this.audio.onpause = null;
      this.audio.onplay = null;
      this.audio.oncanplay = null;
      document.body.removeChild(this.audio);
    }

    this.oCtx = null; 
    this.audioSrc = null; 
    this.analyser = null;
    this.voiceHeight = null; 
  }
  openMusic(src : File) : void {
    const audio = this.audio;
    if(audio) {
      audio.src = window.URL.createObjectURL(src);
      audio.load();
      setTimeout(() => {
        if(audio.error != null){
          let err = '未知错误';
          switch(audio.error.code) {
            case 1: err = '操作被终止';break;
            case 2: err = '打开文件时出现了错误';break;
            case 3: err = '无法解码该文件';break;
            case 4: err = '不支持的音频格式';break;
          }
          this.emit('error', err);     
          this.updateStatus('stopped');
        }else {
          if(this.oCtx == null) 
            this.initContext();
          this.updateStatus('opened');
          this.playPause();
        }
      }, 600);
    }
  }
  stopMusic(autoEnd = false) : void {
    const audio = this.audio;
    if(audio) {
      if(autoEnd) {
        audio.pause();
        audio.src = '';
      }else {
        this.doFadeOut(() => {
          audio.pause();
          audio.src = '';
        })
      }

      clearInterval(this.audioTimer);
      this.audioOpened = false;
      this.updateStatus('stopped');
    }
  }
  playPause() : void {
    const audio = this.audio;
    if(audio) {
      if(audio.paused) this.play();
      else this.pause();
    }
  }
  pause() : void {
    const audio = this.audio;
    if(audio) {
      if(!audio.paused && !this.audioFading) {
        this.doFadeOut(() => {
          audio.pause();
          this.updateStatus('paused');
        });
      }
    }
  }
  play() : void {
    const audio = this.audio;
    if(audio) {
      if(audio.paused && !this.audioFading) {
        audio.play();
        this.doFadeIn(() => {
          this.updateStatus('playing');
        })
      } else if(this.status!='playing')
        this.updateStatus('playing');
    }
  }

  private doFadeOut(callback : () => void) : void {
    const audio = this.audio;
    if(audio) {
      if(this.status == 'playing'){

        const fadeMs = 500;
        const timeStep = fadeMs / 40.0;
        const endVolume = audio.volume;
        const volumeStep = (endVolume - 0.01) / timeStep;

        if(this.audioFading) 
          clearInterval(this.audioFadeInterval);
        this.audioFading = true;
        this.audioFadeInterval = setInterval(() => {
          if(audio.volume > 0.01 && audio.volume - volumeStep >= 0) 
            audio.volume-=volumeStep;
          else {
            clearInterval(this.audioFadeInterval);
            callback();
            this.audioFading = false;
            audio.volume = endVolume;
          }
        }, 40);

      }else callback();
    }
  }
  private doFadeIn(callback : () => void) : void {
    const audio = this.audio;
    if(audio) {
      if(audio.currentTime > 0){
    
        const fadeMs = 500;
        const timeStep = fadeMs / 40.0;
        const endVolume = audio.volume;
        const volumeStep = (endVolume - 0.01) / timeStep;

        audio.volume = 0.01;
        if(this.audioFading) 
          clearInterval(this.audioFadeInterval);
        this.audioFading = true;
        this.audioFadeInterval = setInterval(() => {
          if(audio.volume < endVolume && audio.volume + volumeStep <= 1) 
            audio.volume+=volumeStep;
          else {
            audio.volume = endVolume;
            clearInterval(this.audioFadeInterval);
            this.audioFading = false;
            callback();
          }
        }, 40);
      }else callback();
    }
  }

  setVolume(v : number) : void {
    const audio = this.audio;
    if(audio) {
      this.volume = v;
      audio.volume = v / 100;
    }
  }
  trackStart() : void {
    this.audioTracking = true;
  }
  trackEnd(val : number) : void {
    const audio = this.audio;
    if(audio) {
      this.audioTracking = false;
      if(this.audioOpened) {
        audio.currentTime = val;
        if(audio.paused) 
          this.play();
        this.updateStatus('playing');
      }
    }
  }
  updateTrack() : void {
    this.emit('update-track',  (this.playProgress*100));
    this.emit('update-time',  this.playtimeString, this.playtime);
  }
  updateStatus(status : MusicPlayerStatus) : void {
    this.status = status;
    this.emit('statuschanged', status);
  }
  onPlayerCanPlay() : void {
    const audio = this.audio;
    if(audio) {
      this.audioDurtion = audio.duration;
      this.audioDurtionString = getTimeStringSec(audio.duration.toString());
      if(!this.audioOpened) {
        this.audioOpened = true;
      }
    }
  }
  onPlayerEnded() : void {
    this.stopMusic(true);
  }
  onPlayerPause() : void {
    this.updateStatus('paused');
    clearInterval(this.audioTimer);
  }
  onPlayerPlay() : void {
    setInterval(this.onPlayerTick.bind(this), 1000);
    this.updateStatus('playing');
  }

  public playtime = 0;
  public playtimeString = '';
  public playProgress = 0;

  onPlayerTick() : void {
    const audio = this.audio;
    if(audio) {
      if(!this.audioTracking) {
        this.playtime = audio.currentTime;
        this.playtimeString = getTimeStringSec(audio.currentTime.toString()) + '/' + this.audioDurtionString;
        this.playProgress = audio.currentTime / audio.duration;
        this.updateTrack();
      }
    }
  }
}