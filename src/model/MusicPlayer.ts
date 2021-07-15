import { EventEmitter } from 'events';
import { getTimeStringSec } from '../utils/Utils'


export type MusicPlayerStatus = 'stopped'|'opened'|'paused'|'playing'; 

//=============================
// Player 
//=============================

export class MusicPlayer extends EventEmitter {

  public constructor() {
    super();
  }

  public audio : HTMLAudioElement = null;
  public audioTracking = false;
  public audioDurtion = 0;
  public audioDurtionString = '';
  public status : MusicPlayerStatus = 'stopped';
  public analyser : AnalyserNode;
  public volume = 100;
  public voiceHeight : Uint8Array = null;
  public audioWaveCount = 128;
  public audioOpened = false;

  private oCtx : AudioContext = null;
  private audioTimer = null;
  private audioSrc : MediaElementAudioSourceNode = null;
  private audioFading = false;
  private audioFadeInterval = null;

  initPlayer() {

    this.audio = document.createElement('audio');
    this.audio.autoplay = false;
    this.audio.onended = this.onPlayerEnded.bind(this);
    this.audio.onpause = this.onPlayerPause.bind(this);
    this.audio.onplay = this.onPlayerPlay.bind(this);
    this.audio.oncanplay = this.onPlayerCanPlay.bind(this);

    document.body.appendChild(this.audio);
  }
  initContext() {
    this.oCtx = new AudioContext();
    this.audioSrc = this.oCtx.createMediaElementSource(this.audio);
    this.analyser = this.oCtx.createAnalyser();

    this.audioSrc.connect(this.analyser);
    this.analyser.connect(this.oCtx.destination);

    this.voiceHeight = new Uint8Array(this.analyser.frequencyBinCount);
  }
  destroyPlayer() {
    this.audio.onended = null;
    this.audio.onpause = null;
    this.audio.onplay = null;
    this.audio.oncanplay = null;
    this.oCtx = null; 
    this.audioSrc = null; 
    this.analyser = null;
    this.voiceHeight = null; 

    document.body.removeChild(this.audio);
  }
  openMusic(src) {
    this.audio.src = window.URL.createObjectURL(src);
    this.audio.load();
    setTimeout(() => {
      if(this.audio.error != null){
        var err = '未知错误';
        switch(this.audio.error.code) {
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
  stopMusic(autoEnd = false) {

    if(autoEnd) {
      this.audio.pause();
      this.audio.src = '';
    }else {
      this.doFadeOut(() => {
        this.audio.pause();
        this.audio.src = '';
      })
    }

    clearInterval(this.audioTimer);
    this.audioOpened = false;
    this.updateStatus('stopped');
  }
  playPause() {
    if(this.audio.paused) this.play();
    else this.pause();
  }
  pause() {
    if(!this.audio.paused && !this.audioFading) {
      this.doFadeOut(() => {
        this.audio.pause();
        this.updateStatus('paused');
      });
    }
  }
  play() {
    if(this.audio.paused && !this.audioFading) {
      this.audio.play();
      this.doFadeIn(() => {
        this.updateStatus('playing');
      })
    } else if(this.status!='playing')
      this.updateStatus('playing');
  }

  private doFadeOut(callback : () => void) {
    if(this.status == 'playing'){

      let fadeMs = 500;
      let timeStep = fadeMs / 40.0;
      let endVolume = this.audio.volume;
      let volumeStep = (endVolume - 0.01) / timeStep;

      if(this.audioFading) 
        clearInterval(this.audioFadeInterval);
      this.audioFading = true;
      this.audioFadeInterval = setInterval(() => {
        if(this.audio.volume > 0.01 && this.audio.volume - volumeStep >= 0) 
          this.audio.volume-=volumeStep;
        else {
          clearInterval(this.audioFadeInterval);
          callback();
          this.audioFading = false;
          this.audio.volume = endVolume;
        }
      }, 40);

    }else callback();
  }
  private doFadeIn(callback : () => void) {
    if(this.audio.currentTime > 0){
  
      let fadeMs = 500;
      let timeStep = fadeMs / 40.0;
      let endVolume = this.audio.volume;
      let volumeStep = (endVolume - 0.01) / timeStep;

      this.audio.volume = 0.01;
      if(this.audioFading) 
        clearInterval(this.audioFadeInterval);
      this.audioFading = true;
      this.audioFadeInterval = setInterval(() => {
        if(this.audio.volume < endVolume && this.audio.volume + volumeStep <= 1) 
          this.audio.volume+=volumeStep;
        else {
          this.audio.volume = endVolume;
          clearInterval(this.audioFadeInterval);
          this.audioFading = false;
          callback();
        }
      }, 40);
    }else callback();
  }

  setVolume(v : number) {
    this.volume = v;
    this.audio.volume = v / 100;
  }
  trackStart() {
    this.audioTracking = true;
  }
  trackEnd(val : number) {
    this.audioTracking = false;
    if(this.audioOpened) {
      this.audio.currentTime = val;
      if(this.audio.paused) 
        this.play();
      this.updateStatus('playing');
    }
  }
  updateTrack() {
    this.emit('update-track',  (this.playProgress*100));
    this.emit('update-time',  this.playtimeString, this.playtime);
  }
  updateStatus(status : MusicPlayerStatus) {
    this.status = status;
    this.emit('statuschanged', status);
  }

  onPlayerCanPlay() {
    this.audioDurtion = this.audio.duration;
    this.audioDurtionString = getTimeStringSec(this.audio.duration.toString());
    if(!this.audioOpened) {
      this.audioOpened = true;
    }
  }
  onPlayerEnded() {
    this.stopMusic(true);
  }
  onPlayerPause() {
    this.updateStatus('paused');
    clearInterval(this.audioTimer);
  }
  onPlayerPlay() {
    setInterval(this.onPlayerTick.bind(this), 1000);
    this.updateStatus('playing');
  }

  public playtime = 0;
  public playtimeString = '';
  public playProgress = 0;

  onPlayerTick() {
    if(!this.audioTracking) {
      this.playtime = this.audio.currentTime;
      this.playtimeString = getTimeStringSec(this.audio.currentTime.toString()) + '/' + this.audioDurtionString;
      this.playProgress = this.audio.currentTime / this.audio.duration;
      this.updateTrack();
    }
  }
}