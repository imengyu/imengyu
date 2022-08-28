<template>
  <div :class="'imengyu-main '+((setEnableAnim && currentGameAnim != 'sort')?'dark':'')">  

    <!--Canvas-->
    <CanvasAnimHost v-show="gameProvider==sortGameProvider" ref="sortGameCanvasAnimHost" :gameProvider="(sortGameProvider as unknown as CanvasGameProvider)"></CanvasAnimHost>
    <!-- <CanvasAnimHost v-show="setEnableAnim && gameProvider==blackholeGameProvider" ref="blackholeGameCanvasAnimHost" :gameProvider="(blackholeGameProvider as unknown as CanvasGameProvider)" :create2DCtx="false"></CanvasAnimHost> -->
    <CanvasAnimHost v-show="setEnableAnim && gameProvider==clockGameProvider" ref="clockGameCanvasAnimHost" :gameProvider="(clockGameProvider as unknown as CanvasGameProvider)"></CanvasAnimHost>
    
    <!--Intro-->
    <div class="imengyu-intro animated fadeInRight" v-show="showIntro && (currentGameAnim=='sort' || !setEnableAnim)">
      <div class="imengyu-intro-box animated position-relative overflow-hidden" >

        <h1>你好，我是快乐的梦鱼</h1>
        <i class="text animated fadeInLeft">是一只小程序员 前端开发/UI设计</i>
        <i class="text animated fadeInLeft">很开心你来访问 ヾ(•ω•`)o</i>

        <div class="imengyu-go-button big animated fadeInLeft" @click="onGo">
          更多关于我
          <i class="iconfont icon-jiantou_xiangyouliangci_o"></i>
        </div>

      </div>
    </div>
    
    <!--Main-->
    <router-view v-slot="{ Component }">
      <transition v-show="!showIntro" enter-active-class="bounceInRight" leave-active-class="fadeOutLeft"> 
        <component :is="Component"/>
      </transition>
    </router-view>

    <!--版权提示-->
    <AlertDialog v-model:show="showCopyright" title="Copyright" subTitle="网页版权信息">

      <i class="iconfont icon-banquan"></i> 2021 快乐的梦鱼 版权所有
      <br>本网站所有设计与内容均为作者原创。
      <br>如须转载，请事先联系我。谢谢你!

      <div class="imengyu-content-line"></div>
      <div class="text-center">
        <div class="imengyu-go-button" @click="showCopyright=false">
          好哒
        </div>
      </div>

    </AlertDialog>

    <!--音乐控件-->
    <MusicGameControll 
      ref="musicGameControll"
      :canvasGames="(gameProviders as CanvasGameProvider[])"
      :currentCanvasGame="(gameProvider as CanvasGameProvider)"
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
          <span class="imengyu-icon-down">▼</span>
        </div>
      </div>
      <div class="item">
        <span>FPS</span>
        <div v-if="canvasAnimHost" class="imengyu-go-button mt-0">
          {{ canvasAnimHost.currentFpsShowVal }}
        </div>
      </div>
      <!-- <div v-if="currentGameAnim=='blackhole'" class="item">
        <span>模式</span>
        <div>
          <div class="imengyu-go-button mt-0">
            更换
            <select ref="selectBlackholeGame" class="imengyu-sort-mode-select" :value="currentBlackholeGameAnim" @change="onChangeBlackholeGameAnim">
              <option v-for="(i, ind) in blackholeGameAmins" :key="ind" :value="i">{{i}}</option>
            </select>
          </div>
        </div>
      </div> -->
      <div v-if="currentGameAnim=='clock'" class="item">
        <span>模式</span>
        <div>
          <div class="imengyu-go-button mt-0">
            更换
            <select ref="selectClockGame" class="imengyu-sort-mode-select" @change="onChangeClockGameAnim">
              <option v-for="(i, ind) in clockGameAmins" :key="ind" :value="i">{{i}}</option>
            </select>
            <span class="imengyu-icon-down light">▼</span>
          </div>
        </div>
      </div>
      <div v-if="currentGameAnim=='sort' && sortGameProvider.currentSortMethod !== 'spectrum'" class="item">
        <span>排序方法</span>
        <div v-if="gameProvider" class="imengyu-icon-sort-text" title="点击更改当前动画排序方式">
          <div class="inn" :style="'width:'+sortGameProvider.sortStepPrecent+'%'">
            <span>{{ sortGameProvider.currentSortMethod }} sor</span>
          </div>
          {{ sortGameProvider.currentSortMethod }} sort
          <select
            ref="selectSortMethod"
            class="imengyu-sort-mode-select"
            :value="sortGameProvider.currentSortMethod"
            @change="onChangeSortMethod"
          >
            <option v-for="(i, ind) in sortMethodNames" :key="ind" :value="i">{{i}} sort</option>
          </select>
          <span class="imengyu-icon-down">▼</span>
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
    <Footer @on-show-copyright="showCopyright=true" />

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CanvasAnimHost, { ICanvasAnimHost } from '../components/CanvasAnimHost.vue'
import Footer from '../components/Footer.vue'
import AlertDialog from '../components/AlertDialog.vue'
import MusicGameControll from '../components/MusicGameControll.vue'
import Utils from '../utils/Utils'
import { CanvasSortGame, SortMethodNames, SortMethods } from '../model/CanvasSortGame/CanvasSortGame'
//import { BlackHoleGame, BlackHoleWorkMode, getBlackHoleModes } from '../model/BlackHoleGame/BlackHoleGame'
import { ClockGame, getStartsModes, StartsMode } from '../model/ClockGame/ClockGame'
import { CanvasGameProvider } from '../model/CanvasGameProvider'
import { emitter } from '@/main'
import Const from '@/const/Const'

export default defineComponent({
  name: 'Index',
  components: {
    CanvasAnimHost,
    Footer,
    AlertDialog,
    MusicGameControll,
  },
  data() {
    return {
      showIntro: true,
      showCopyright: false,
      showSetting: false,
      showAnimTools: true,

      gameProvider: null as CanvasGameProvider|null,
      sortGameProvider: new CanvasSortGame(),
      //blackholeGameProvider: new BlackHoleGame(),
      clockGameProvider: new ClockGame(),

      gameAmins: [ 'sort', /*'blackhole',*/ 'clock' ],
      gameProviders: [] as CanvasGameProvider[],

      canvasAnimHost: null as ICanvasAnimHost|null,
      currentGameAnim: '',
      sortMethodNames: SortMethodNames,

      //blackholeGameAmins: getBlackHoleModes(),
      //currentBlackholeGameAnim: getBlackHoleModes()[0] as BlackHoleWorkMode,
      clockGameAmins: getStartsModes(),

      setEnableAnim: true,
      setVolume: 50,
      setEnableDrag: false,

      currentCanvasAnimHost: null as ICanvasAnimHost|null,
      sortGameCanvasAnimHost: null as ICanvasAnimHost|null,
      //blackholeGameCanvasAnimHost: null as ICanvasAnimHost|null,
      clockGameCanvasAnimHost: null as ICanvasAnimHost|null,

      introInterval: 0,
    }
  },
  methods: {
    onChangeGameAnim() {
      this.currentGameAnim = (this.$refs.selectGame as HTMLSelectElement).value;
      switch(this.currentGameAnim) {
        case 'sort': this.gameProvider = this.sortGameProvider; break;
        //case 'blackhole': this.gameProvider = this.blackholeGameProvider; break;
        case 'clock': this.gameProvider = this.clockGameProvider; break;
      }
      emitter.emit('updateDarkMode', this.currentGameAnim != 'sort');
      this.onSetEnableAnimChanged();
    },
    onChangeSortMethod() {
      this.sortGameProvider.changeSortMethod((this.$refs.selectSortMethod as HTMLSelectElement).value as SortMethods);
    },
    /* onChangeBlackholeGameAnim() {
      if(this.currentGameAnim === 'blackhole')
        this.blackholeGameProvider.setBlackHoleWorkMode((this.$refs.selectBlackholeGame as HTMLSelectElement).value as BlackHoleWorkMode)
    }, */
    onChangeClockGameAnim() {
      if(this.currentGameAnim === 'clock')
        this.clockGameProvider.setStarsMode((this.$refs.selectClockGame as HTMLSelectElement).value as StartsMode)
    },
    onSetEnableAnimChanged() {

      if(this.currentCanvasAnimHost)
        this.currentCanvasAnimHost.stop();

      if(this.currentGameAnim === 'sort') this.canvasAnimHost = this.sortGameCanvasAnimHost;
      //else if(this.currentGameAnim === 'blackhole') this.canvasAnimHost = this.blackholeGameCanvasAnimHost;
      else if(this.currentGameAnim === 'clock') this.canvasAnimHost = this.clockGameCanvasAnimHost;

      if(this.setEnableAnim && (this.currentGameAnim === 'blackhole' || this.currentGameAnim === 'clock')) 
        emitter.emit('updateDarkMode', true);
      if(!this.setEnableAnim || this.currentGameAnim === 'sort') 
        emitter.emit('updateDarkMode', false);

      if(this.canvasAnimHost) {
        if(this.setEnableAnim) this.canvasAnimHost.start();
        else this.canvasAnimHost.stop();
      }
      this.currentCanvasAnimHost = this.canvasAnimHost;
    },
    onAnimSwitchSpectrum(on : boolean) {
      if(this.currentGameAnim === 'sort') this.sortGameProvider.switchSpectrum(on);
      //else if(this.currentGameAnim === 'blackhole') this.blackholeGameProvider.switchSpectrum(on);
      else if(this.currentGameAnim === 'clock') this.clockGameProvider.switchSpectrum(on);
    },
    onGo() {
      this.$router.push({name:'About'})
    },
    onRoute() {
      this.showIntro = this.$route.path == '/';
      window.scrollTo({ top: 0 })
    },
    hideLoadingMask() {
      const loading = document.getElementById('imengyu-loading-mask');
      if(loading) {
        loading.classList.add('hide');
        setTimeout(() => {
          loading.style.display = 'none';
        }, 300)
      }
    },
    loadSettings() {
      this.setEnableAnim = Utils.getSettingsBoolean('setEnableAnim', true);
      this.showAnimTools = Utils.getSettingsBoolean('showAnimTools', true);
      this.setVolume = Utils.getSettingsNumber('setVolume', 50);
      if(window.outerWidth < 600)
        this.showAnimTools = false;
    },
    saveSettings() {
      Utils.setSettingsBoolean('setEnableAnim', this.setEnableAnim);
      Utils.setSettingsBoolean('showAnimTools', this.showAnimTools);
      Utils.setSettingsNumber('setVolume', this.setVolume);
    }
  },
  watch: {
    $route() { this.onRoute() }
  },
  mounted() {
    this.loadSettings();
    this.onRoute();
    this.hideLoadingMask();

    document.title = Const.SiteName;

    this.currentGameAnim = 'sort';
    setTimeout(() => {
      this.sortGameCanvasAnimHost = this.$refs.sortGameCanvasAnimHost as ICanvasAnimHost;
      //this.blackholeGameCanvasAnimHost = this.$refs.blackholeGameCanvasAnimHost as ICanvasAnimHost;
      this.clockGameCanvasAnimHost = this.$refs.clockGameCanvasAnimHost as ICanvasAnimHost;
      this.gameProvider = this.sortGameProvider;
      this.gameProviders = [ 
        this.sortGameProvider, 
        //this.blackholeGameProvider, 
        this.clockGameProvider 
      ];
      if(this.setEnableAnim)
        this.onSetEnableAnimChanged();
    }, 350);

    window.onbeforeunload = () => { this.saveSettings(); };
  },
  beforeUnmount() {
    clearInterval(this.introInterval);
    this.saveSettings();
  }

})

</script>