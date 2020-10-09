<template>
  <div class="imengyu-main">  

    <!--Canvas-->
    <CanvasAnimHost ref="canvasAnimHost" :gameProvider="gameProvider"></CanvasAnimHost>
    
    <!--Intro-->
    <div v-show="showIntro" class="imengyu-intro animated zoomIn">
      <div class="imengyu-intro-box">
        <h1>Hi  <small class="ml-3">i am Mengyu</small></h1>
        <i class="animated fadeInLeft">I'm a programmer / student</i>
        <i class="animated fadeInRight">front-end developer / designer</i>
        <i class="animated fadeInLeft">In Hangzhou</i>
        <div class="imengyu-go-button animated fadeInLeft" @click="onGo">
          More about me
          <i class="iconfont icon-jiantou_xiangyouliangci_o"></i>
        </div>
        <i class="tip animated fadeInRight">
          非常感谢您百忙之中来到这里<br>
          这是我的个人网站小作品<br>
          才学疏浅可能不能让您满意<br>
          但还是希望您能喜欢
        </i>
      </div>
    </div>
    <!--Main-->
    <transition v-show="!showIntro" enter-active-class="bounceInRight" leave-active-class="fadeOutLeft"> 
      <router-view></router-view>
    </transition>

    <!--版权提示-->
    <AlertDialog v-model="showCopyright" title="Copyright" subTitle="网页版权信息">

      <i class="iconfont icon-banquan"></i> 2020 梦欤 版权所有
      <br>本网站所有设计均为作者原创。
      <br>仅本人使用，不在任何商业用途中使用。
      <br>如须转载，请事先联系我。Thank you!

      <div class="imengyu-content-line"></div>

      <div class="imengyu-go-button" @click="showCopyright=false">
        我知道了
      </div>

    </AlertDialog>

    <!--音乐控件-->
    <MusicGameControll 
      ref="musicGameControll"
      :canvasGame="gameProvider"
      :playerVolume="setVolume"
      :class="showAnimTools?'open':''"
      :open="showAnimTools"
      @update-volume="(v) => setVolume = v"
      @show-settings="showSetting=true"
      @on-go-spectrum-mode="gameProvider.switchSpectrum(true)"
      @on-quit-spectrum-mode="gameProvider.switchSpectrum(false)">
      <div class="imengyu-go-button mr-3 mt-0" @click="setEnableAnim=!setEnableAnim;onSetEnableAnimChanged()" title="点击这里开启或关闭背景动画">
        动画{{ setEnableAnim ? '开' : '关' }}
      </div>
      <div v-if="gameProvider" :class="'imengyu-icon-sort-text mr-3 '+(gameProvider.currentSortMethod=='spectrum'?'spectrum':'')"
        :title="gameProvider.currentSortMethod!='spectrum'?'点击更改当前动画排序方式':$refs.musicGameControll.audioCurrentName">
        <div class="inn" :style="'width:'+gameProvider.sortStepPrecent+'%'">
          <span>{{ gameProvider.currentSortMethod }} {{gameProvider.currentSortMethod!='spectrum'?'sort':''}}</span>
        </div>
        <div v-show="gameProvider.currentSortMethod!='spectrum'&&gameProvider.currentSortMethod!=''" class="info">
          <div>Data count: {{ gameProvider.dataCount }}</div>
          <div>Array access: {{ gameProvider.sortAccessCount }}</div>
          <div>Array swap: {{ gameProvider.sortSwapCount }}</div>
        </div>

        {{ gameProvider.currentSortMethod!='spectrum'?gameProvider.currentSortMethod:$refs.musicGameControll.audioCurrentName }} {{gameProvider.currentSortMethod!='spectrum'?'sort':''}}
        <select v-show="gameProvider.currentSortMethod!='spectrum'" ref="selectSortMethod" class="imengyu-sort-mode-select" :value="gameProvider.currentSortMethod" @change="onChangeSortMethod">
          <option v-for="(i, ind) in sortMethodNames" :key="ind" :value="i">{{i}} sort</option>
        </select>
      </div>
      
      <template slot="sw">
        <button class="imengyu-icon-button mr-3 mt-0 open-button" @click="showAnimTools=!showAnimTools" :title="'点击'+(showAnimTools?'收起':'展开')+'动画控制菜单'">
          <i v-if="showAnimTools" class="iconfont icon-xiangzuo_o"></i>
          <i v-else class="iconfont icon-xuanzeqixiayige_o"></i>
        </button>
      </template>
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
import { CanvasSortGame, SortMethodNames, SortMethods } from '../model/CanvasSortGame'
import Utils from '../utils/Utils'

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

  sortMethodNames = SortMethodNames;
  onChangeSortMethod() {
    this.gameProvider.changeSortMethod(<SortMethods>(<HTMLSelectElement>this.$refs.selectSortMethod).value);
  }

  setEnableAnim = true;
  setVolume = 50;

  onSetEnableAnimChanged() {
    if(this.canvasAnimHost)
      if(this.setEnableAnim) this.canvasAnimHost.start();
      else this.canvasAnimHost.stop();
  }

  @Watch('$route')
  onRoute() {
    this.showIntro = this.$route.path == '/';
    window.scrollTo({ top: 0 })
  }
  onGo() {
    this.$router.push({name:'About'})
  }
  
  gameProvider = new CanvasSortGame();
  canvasAnimHost : CanvasAnimHost = null;

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
    document.title = '梦欤的个人网站小作品';
    setTimeout(() => {
      this.canvasAnimHost = <CanvasAnimHost>this.$refs.canvasAnimHost;
      if(this.setEnableAnim)
        this.canvasAnimHost.start();
    }, 150);

    window.onbeforeunload = () => { this.saveSettings(); };
  }
  beforeDestroy() {
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