<template>
  <div :class="'imengyu-main '+((setEnableAnim && currentGameAnim != 'sort')?'dark':'')">  

    <!--Canvas-->
    <CanvasAnimHost v-show="gameProvider==sortGameProvider" ref="sortGameCanvasAnimHost" :gameProvider="sortGameProvider"></CanvasAnimHost>
    <CanvasAnimHost v-show="setEnableAnim && gameProvider==spaceGameProvider" ref="spaceGameCanvasAnimHost" :gameProvider="spaceGameProvider" :create2DCtx="false"></CanvasAnimHost>
    <CanvasAnimHost v-show="setEnableAnim && gameProvider==blackholeGameProvider" ref="blackholeGameCanvasAnimHost" :gameProvider="blackholeGameProvider" :create2DCtx="false"></CanvasAnimHost>
    <CanvasAnimHost v-show="setEnableAnim && gameProvider==clockGameProvider" ref="clockGameCanvasAnimHost" :gameProvider="clockGameProvider"></CanvasAnimHost>
    
    <!--Intro-->
    
    <div class="imengyu-intro animated fadeInRight" v-show="showIntro && (currentGameAnim=='sort' || !setEnableAnim)">
      <div class="imengyu-intro-box animated position-relative overflow-hidden" >
        <div class="background">
          <img class="hello" src="@/assets/images/hello.png" />
          <img class="rainbow" src="@/assets/images/rainbow.png" />
        </div>
        <h1><span>你好，我是</span> <br/><small class="name">快乐的梦鱼</small></h1>
        <i class="text animated fadeInLeft">我是一个程序员</i>
        <i class="text animated fadeInRight">擅长前端开发/UI设计</i>
        <i class="text animated fadeInLeft">在浙江杭州</i>
        <i class="text tip animated fadeInRight">          
          非常感谢您百忙之中来到这里,<br>
          这是我的个人网站小作品,<br>
          才学疏浅可能不能让您满意,<br>
          但还是希望您能喜欢,
        </i>
        <div class="imengyu-go-button animated fadeInLeft" @click="onGo">
          更多关于我
          <i class="iconfont icon-jiantou_xiangyouliangci_o"></i>
        </div>
      </div>
    </div>
    
    <!--Main-->
    <transition v-show="!showIntro" enter-active-class="bounceInRight" leave-active-class="fadeOutLeft"> 
      <router-view></router-view>
    </transition>

    <!--版权提示-->
    <AlertDialog v-model="showCopyright" title="Copyright" subTitle="网页版权信息">

      <i class="iconfont icon-banquan"></i> 2021 快乐的梦鱼 版权所有
      <br>本网站所有设计均为作者原创。
      <br>仅本人使用，不在任何商业用途中使用。
      <br>如须转载，请事先联系我。谢谢你!

      <div class="imengyu-content-line"></div>

      <div class="imengyu-go-button" @click="showCopyright=false">
        我知道了
      </div>

    </AlertDialog>

    <!--音乐控件-->
    <MusicGameControll 
      ref="musicGameControll"
      :canvasGames="gameProviders"
      :currentCanvasGame="gameProvider"
      :playerVolume="setVolume"
      :class="showAnimTools?'open':''"
      :open="showAnimTools"
      @switch-open="showAnimTools=!showAnimTools"
      @update-volume="(v) => setVolume = v"
      @show-settings="showSetting=true"
      @on-go-spectrum-mode="onAnimSwitchSpectrum(true)"
      @on-quit-spectrum-mode="onAnimSwitchSpectrum(false)">
      <div class="item">
        <span>动画</span>
        <div class="imengyu-go-button mt-0" @click="setEnableAnim=!setEnableAnim;onSetEnableAnimChanged()" title="点击这里开启或关闭背景动画">
          {{ setEnableAnim ? '开' : '关' }}
        </div>
        <div v-show="setEnableAnim" class="imengyu-icon-sort-text" title="更改动画">
          {{ currentGameAnim }}
          <select ref="selectGame" class="imengyu-sort-mode-select" :value="currentGameAnim" @change="onChangeGameAnim">
            <option v-for="(i, ind) in gameAmins" :key="ind" :value="i">{{i}}</option>
          </select>
        </div>
      </div>
      <div class="item">
        <span>FPS</span>
        <div v-if="canvasAnimHost" class="imengyu-go-button mt-0">
          {{ canvasAnimHost.currentFpsShowVal }}
        </div>
      </div>
      <div v-if="currentGameAnim=='space'" class="item">
        <span>拖动视图</span>
        <div>
          <div class="imengyu-go-button mt-0" @click="setEnableDrag=!setEnableDrag;onEnableDragChanged()">
            {{ setEnableDrag ? '开' : '关' }}
          </div>
        </div>
      </div>
      <div v-if="currentGameAnim=='blackhole'" class="item">
        <span>模式</span>
        <div>
          <div class="imengyu-go-button mt-0">
            更换
            <select ref="selectBlackholeGame" class="imengyu-sort-mode-select" :value="currentBlackholeGameAnim" @change="onChangeBlackholeGameAnim">
              <option v-for="(i, ind) in blackholeGameAmins" :key="ind" :value="i">{{i}}</option>
            </select>
          </div>
        </div>
      </div>
      <div v-if="currentGameAnim=='clock'" class="item">
        <span>模式</span>
        <div>
          <div class="imengyu-go-button mt-0">
            更换
            <select ref="selectClockGame" class="imengyu-sort-mode-select" @change="onChangeClockGameAnim">
              <option v-for="(i, ind) in clockGameAmins" :key="ind" :value="i">{{i}}</option>
            </select>
          </div>
        </div>
      </div>
      <div v-if="currentGameAnim=='sort' && sortGameProvider.currentSortMethod!='spectrum'" class="item">
        <span>排序方法</span>
        <div v-if="gameProvider" :class="'imengyu-icon-sort-text '+(sortGameProvider.currentSortMethod=='spectrum'?'spectrum':'')"
          :title="sortGameProvider.currentSortMethod!='spectrum'?'点击更改当前动画排序方式':'正在播放音乐'">
          <div class="inn" :style="'width:'+sortGameProvider.sortStepPrecent+'%'">
            <span>{{ sortGameProvider.currentSortMethod }} {{sortGameProvider.currentSortMethod!='spectrum'?'sort':''}}</span>
          </div>
          {{ sortGameProvider.currentSortMethod!='spectrum'?sortGameProvider.currentSortMethod:'' }} {{sortGameProvider.currentSortMethod!='spectrum'?'sort':''}}
          <select v-show="sortGameProvider.currentSortMethod!='spectrum'" ref="selectSortMethod" class="imengyu-sort-mode-select" :value="sortGameProvider.currentSortMethod" @change="onChangeSortMethod">
            <option v-for="(i, ind) in sortMethodNames" :key="ind" :value="i">{{i}} sort</option>
          </select>
        </div>
      </div>
      <div v-if="currentGameAnim=='sort'" class="item">
        <span></span>
        <div v-show="sortGameProvider.currentSortMethod!='spectrum'&&sortGameProvider.currentSortMethod!=''" class="imengyu-icon-sort-info">
          <div>Data count: {{ sortGameProvider.dataCount }}</div>
          <div>Array access: {{ sortGameProvider.sortAccessCount }}</div>
          <div>Array swap: {{ sortGameProvider.sortSwapCount }}</div>
        </div>
      </div>
    </MusicGameControll>

    <!--脚-->
    <Footer v-model="showCopyright" />

  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import CanvasAnimHost from '../components/CanvasAnimHost.vue'
import Footer from '../components/Footer.vue'
import AlertDialog from '../components/AlertDialog.vue'
import MusicGameControll from '../components/MusicGameControll.vue'
import Utils from '../utils/Utils'
import { CanvasSortGame, SortMethodNames, SortMethods } from '../model/CanvasSortGame/CanvasSortGame'
import { ThreeSpaceGame } from '../model/ThreeSpaceGame/ThreeSpaceGame'
import { BlackHoleGame, BlackHoleWorkMode, getBlackHoleModes } from '../model/BlackHoleGame/BlackHoleGame'
import { ClockGame, getStartsModes, StartsMode } from '../model/ClockGame/ClockGame'
import { CanvasGameProvider } from '../model/CanvasGameProvider'
import { bus } from '..'

@Component({
  components: {
    CanvasAnimHost,
    Footer,
    AlertDialog,
    MusicGameControll,
  }
})
export default class Index extends Vue {

  showIntro = true;
  showCopyright = false;
  showSetting = false;
  showAnimTools = true;

  gameProvider : CanvasGameProvider = null;
  sortGameProvider = new CanvasSortGame();
  spaceGameProvider = new ThreeSpaceGame();
  blackholeGameProvider = new BlackHoleGame();
  clockGameProvider = new ClockGame();

  gameAmins = [ 'sort', 'space', 'blackhole', 'clock' ];
  gameProviders = [ this.sortGameProvider, this.spaceGameProvider, this.blackholeGameProvider, this.clockGameProvider ];

  canvasAnimHost : CanvasAnimHost = null;
  currentGameAnim = this.gameAmins[0];
  sortMethodNames = SortMethodNames;
 
  onChangeGameAnim() {
    this.currentGameAnim = (<HTMLSelectElement>this.$refs.selectGame).value;
    switch(this.currentGameAnim) {
      case 'sort': this.gameProvider = this.sortGameProvider; break;
      case 'space': this.gameProvider = this.spaceGameProvider; break;
      case 'blackhole': this.gameProvider = this.blackholeGameProvider; break;
      case 'clock': this.gameProvider = this.clockGameProvider; break;
    }
    bus.$emit('updateDarkMode', this.currentGameAnim != 'sort');
    this.onSetEnableAnimChanged();
  }
  onChangeSortMethod() {
    this.sortGameProvider.changeSortMethod(<SortMethods>(<HTMLSelectElement>this.$refs.selectSortMethod).value);
  }

  blackholeGameAmins = getBlackHoleModes();
  currentBlackholeGameAnim = this.blackholeGameAmins[0];

  onChangeBlackholeGameAnim() {
    if(this.currentGameAnim === 'blackhole')
      this.blackholeGameProvider.setBlackHoleWorkMode((this.$refs.selectBlackholeGame as HTMLSelectElement).value as BlackHoleWorkMode)
  }

  clockGameAmins = getStartsModes();

  onChangeClockGameAnim() {
    if(this.currentGameAnim === 'clock')
      this.clockGameProvider.setStarsMode((this.$refs.selectClockGame as HTMLSelectElement).value as StartsMode)
  }

  setEnableAnim = true;
  setVolume = 50;
  setEnableDrag = false;

  onSetEnableAnimChanged() {

    if(this.currentCanvasAnimHost)
      this.currentCanvasAnimHost.stop();

    if(this.currentGameAnim === 'sort') this.canvasAnimHost = this.sortGameCanvasAnimHost;
    else if(this.currentGameAnim === 'space') this.canvasAnimHost = this.spaceGameCanvasAnimHost;
    else if(this.currentGameAnim === 'blackhole') this.canvasAnimHost = this.blackholeGameCanvasAnimHost;
    else if(this.currentGameAnim === 'clock') this.canvasAnimHost = this.clockGameCanvasAnimHost;

    if(this.setEnableAnim && (this.currentGameAnim === 'space' || this.currentGameAnim === 'blackhole' || this.currentGameAnim === 'clock')) 
      bus.$emit('updateDarkMode', true);
    if(!this.setEnableAnim || this.currentGameAnim === 'sort') 
      bus.$emit('updateDarkMode', false);

    if(this.canvasAnimHost) {
      if(this.setEnableAnim) this.canvasAnimHost.start();
      else this.canvasAnimHost.stop();
    }
    this.currentCanvasAnimHost = this.canvasAnimHost;
  }
  onAnimSwitchSpectrum(on : boolean) {
    if(this.currentGameAnim === 'sort') this.sortGameProvider.switchSpectrum(on);
    else if(this.currentGameAnim === 'space') this.spaceGameProvider.switchSpectrum(on);
    else if(this.currentGameAnim === 'blackhole') this.blackholeGameProvider.switchSpectrum(on);
    else if(this.currentGameAnim === 'clock') this.clockGameProvider.switchSpectrum(on);
  }
  onEnableDragChanged() {
    this.spaceGameProvider.setDragEnable(this.setEnableDrag);
  }


  @Watch('$route')
  onRoute() {
    this.showIntro = this.$route.path == '/';
    window.scrollTo({ top: 0 })
  }
  onGo() {
    this.$router.push({name:'About'})
  }
  
  currentCanvasAnimHost : CanvasAnimHost = null;
  sortGameCanvasAnimHost : CanvasAnimHost = null;
  spaceGameCanvasAnimHost : CanvasAnimHost = null;
  blackholeGameCanvasAnimHost : CanvasAnimHost = null;
  clockGameCanvasAnimHost : CanvasAnimHost = null;

  introInterval = null;

  hideLoadingMask() {
    let loading = document.getElementById('imengyu-loading-mask');
    loading.classList.add('hide');
    setTimeout(() => {
      loading.style.display = 'none';
    }, 300)
  }
  mounted() {
    this.loadSettings();
    this.onRoute();
    this.hideLoadingMask();

    document.title = '快乐的梦鱼 个人网站小作品';

    setTimeout(() => {
      this.sortGameCanvasAnimHost = <CanvasAnimHost>this.$refs.sortGameCanvasAnimHost;
      this.spaceGameCanvasAnimHost = <CanvasAnimHost>this.$refs.spaceGameCanvasAnimHost;
      this.blackholeGameCanvasAnimHost = <CanvasAnimHost>this.$refs.blackholeGameCanvasAnimHost;
      this.clockGameCanvasAnimHost = <CanvasAnimHost>this.$refs.clockGameCanvasAnimHost;
      this.gameProvider = this.sortGameProvider;
      if(this.setEnableAnim)
        this.onSetEnableAnimChanged();
    }, 350);

    window.onbeforeunload = () => { this.saveSettings(); };
  }
  beforeDestroy() {
    clearInterval(this.introInterval);
    this.saveSettings();
  }

  loadSettings() {
    this.setEnableAnim = Utils.getSettingsBoolean('setEnableAnim', true);
    this.showAnimTools = Utils.getSettingsBoolean('showAnimTools', true);
    this.setVolume = Utils.getSettingsNumber('setVolume', 50);
    if(window.outerWidth < 600)
      this.showAnimTools = false;
  }
  saveSettings() {
    Utils.setSettings('setEnableAnim', this.setEnableAnim);
    Utils.setSettings('showAnimTools', this.showAnimTools);
    Utils.setSettings('setVolume', this.setVolume);
  }

}
</script>