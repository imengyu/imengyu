<template>
  <div :class="'imengyu-main '+((setEnableAnim && currentGameAnim=='space')?'dark':'')">  

    <!--Canvas-->
    <CanvasAnimHost v-show="gameProvider==sortGameProvider" ref="sortGameCanvasAnimHost" :gameProvider="sortGameProvider"></CanvasAnimHost>
    <CanvasAnimHost v-show="setEnableAnim && gameProvider==spaceGameProvider" ref="spaceGameCanvasAnimHost" :gameProvider="spaceGameProvider" :create2DCtx="false"></CanvasAnimHost>
    
    <!--Intro-->
    
    <div class="imengyu-intro animated fadeInRight" v-show="showIntro && (currentGameAnim=='sort' || !setEnableAnim)">
      <div class="imengyu-intro-box animated" >
        <div v-show="showIntroIndex===1">
          <h1>Hi  <small class="ml-3">i am imengyu</small></h1>
          <i class="text animated fadeInLeft">I'm a programmer / student</i>
          <i class="text animated fadeInRight">front-end developer / designer</i>
          <i class="text animated fadeInLeft">In Hangzhou</i>
          <i class="text tip animated fadeInRight">          
            Welecome to my website,<br/>
            this is my homepage.<br/>
            Bad design may not satisfy you,<br/>
            but I hope you like it.
          </i>
          <div class="imengyu-go-button animated fadeInLeft" @click="onGo">
            More about me
            <i class="iconfont icon-jiantou_xiangyouliangci_o"></i>
          </div>
        </div>
        <div v-show="showIntroIndex===2" >
          <h1><span style="font-size: 50px">你好，我是</span> <small class="ml-3">imengyu</small></h1>
          <i class="text animated fadeInLeft">我是一个程序员/学生</i>
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
    </div>
    
    <!--Main-->
    <transition v-show="!showIntro" enter-active-class="bounceInRight" leave-active-class="fadeOutLeft"> 
      <router-view></router-view>
    </transition>

    <!--版权提示-->
    <AlertDialog v-model="showCopyright" title="Copyright" subTitle="网页版权信息">

      <i class="iconfont icon-banquan"></i> 2021 imengyu 版权所有
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
      <div v-if="currentGameAnim=='space'" class="item">
        <span>拖动视图</span>
        <div>
          <div class="imengyu-go-button mt-0" @click="setEnableDrag=!setEnableDrag;onEnableDragChanged()">
            {{ setEnableDrag ? '开' : '关' }}
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
  showIntroIndex = 0;
  showCopyright = false;
  showSetting = false;
  showAnimTools = true;

  gameProvider : CanvasGameProvider = null;
  sortGameProvider = new CanvasSortGame();
  spaceGameProvider = new ThreeSpaceGame();

  gameAmins = [ 'sort', 'space' ];
  gameProviders = [ this.sortGameProvider, this.spaceGameProvider ];

  currentGameAnim = this.gameAmins[0];
  sortMethodNames = SortMethodNames;
  onChangeGameAnim() {
    this.currentGameAnim = (<HTMLSelectElement>this.$refs.selectGame).value;
    switch(this.currentGameAnim) {
      case 'sort': this.gameProvider = this.sortGameProvider; break;
      case 'space': this.gameProvider = this.spaceGameProvider; break;
    }
    bus.$emit('updateDarkMode', this.currentGameAnim === 'space');
    this.onSetEnableAnimChanged();
  }
  onChangeSortMethod() {
    this.sortGameProvider.changeSortMethod(<SortMethods>(<HTMLSelectElement>this.$refs.selectSortMethod).value);
  }

  setEnableAnim = true;
  setVolume = 50;
  setEnableDrag = false;

  onSetEnableAnimChanged() {

    if(this.currentCanvasAnimHost)
      this.currentCanvasAnimHost.stop();

    let canvasAnimHost : CanvasAnimHost = null;
    if(this.currentGameAnim === 'sort') canvasAnimHost = this.sortGameCanvasAnimHost;
    else if(this.currentGameAnim === 'space') canvasAnimHost = this.spaceGameCanvasAnimHost;
    
    if(this.setEnableAnim && this.currentGameAnim === 'space') 
      bus.$emit('updateDarkMode', true);
    if(!this.setEnableAnim && this.currentGameAnim === 'space') 
      bus.$emit('updateDarkMode', false);

    if(canvasAnimHost)
      if(this.setEnableAnim) canvasAnimHost.start();
      else canvasAnimHost.stop();
    this.currentCanvasAnimHost = canvasAnimHost;
  }
  onAnimSwitchSpectrum(on : boolean) {
    if(this.currentGameAnim === 'sort') this.sortGameProvider.switchSpectrum(on);
    else if(this.currentGameAnim === 'space') this.spaceGameProvider.switchSpectrum(on);
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

    document.title = '梦欤的个人网站小作品';

    setTimeout(() => {
      this.sortGameCanvasAnimHost = <CanvasAnimHost>this.$refs.sortGameCanvasAnimHost;
      this.spaceGameCanvasAnimHost = <CanvasAnimHost>this.$refs.spaceGameCanvasAnimHost;
      this.gameProvider = this.sortGameProvider;
      if(this.setEnableAnim)
        this.onSetEnableAnimChanged();
    }, 350);

    this.showIntroIndex = 2;
    this.introInterval = setInterval(() => {
      this.showIntroIndex++;
      if(this.showIntroIndex > 2) this.showIntroIndex = 1;
    }, 15000);

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