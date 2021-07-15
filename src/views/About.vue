<template>
  <div class="imengyu-main-host animated" id="about-host">
    <div class="imengyu-content-box">

      <!--头-->
      <div class="imengyu-content-title">
      </div>
      <div class="imengyu-content-box-innern imengyu-about-host" id="about-me">

        <div class="imengyu-content-title text-black left">
          ABOUT ME
          <span>关于我</span>
        </div>
        <div class="imengyu-about-content-left">
          我是 快乐的梦鱼<br>
          一个普普通通的男孩子<br>
          是一个普通的刚刚入行的程序猿<br>
          正在努力学习工作<br>

          <div class="imengyu-about-subtitle">正在学习 <i class="iconfont icon-jiantou_xiangyouliangci_o"></i> </div>
          <div class="imengyu-about-small">
            Web 开发, App 开发, C, Java, Go, PHP, HTML5, <br>
            Javascript, Python, 机器学习, TensorFlow ...<br>
            51单片机, STM32单片机, Arduino, 树莓派, 物联网 ... <br>
          </div>
        </div>

        <div class="imengyu-about-big-image">
          <img src="../assets/images/about-photo-1.jpg" />
        </div>
      
      </div>
      
      <!--技能-->
      <div class="imengyu-content-box-innern" id="my-skills">

        <div class="imengyu-content-sub-title">
          MY SKILLS
          <span>我擅长的</span>
        </div>

        <div class="imengyu-icon-list">         
          <div class="link-item">
            <i class="iconfont icon-wuliudanao_o"></i>
            <span class="title">Front-end desgin</span>
            <span class="subtitle">UI设计 APP界面设计<br>网页设计 官网设计 </span>
          </div>
          <div class="link-item">
            <i class="iconfont icon-cengji_o"></i>
            <span class="title">Front-end develop</span>
            <span class="subtitle">前端开发<br>网站开发 APP开发</span>
          </div>
          <div class="link-item">
            <i class="iconfont icon-ditu_diqiu_o"></i>
            <span class="title">Game develop</span>
            <span class="subtitle">Unity游戏开发<br>H5小游戏制作</span>
          </div>
          <div class="link-item">
            <i class="iconfont icon-iosgengduo_o"></i>
            <span class="title">Learning More</span>
            <span class="subtitle">继续努力学习<br>新的技能</span>
          </div>
        </div>

        <div class="text-center">
          <div class="imengyu-go-button animated fadeInLeft" @click="onGoWorks">
            <i class="iconfont icon-jiantou_yemian_xiangzuo_o"></i> More of My works
          </div>
        </div>
      </div>

      <!--Hello world-->
      <div class="imengyu-content-box-innern" id="hello-world">

        <div class="imengyu-content-sub-title">
          HELLO WORLD
          <span>
            你好
          </span>
        </div>      

        

      </div>

      <!--更多-->
      <div class="imengyu-content-box-innern overflow-visible" id="more-about-me">

        <div class="imengyu-content-sub-title">
          MORE ABOUT ME
          <span>
            更多关于我
          </span>
        </div>      

        <div class="imengyu-about-list show overflow-visible">

          <div class="imengyu-content-innern-subtitle">我是什么样的？</div>
          一个普通的男生，长相一般，内向，不善闲聊。<br>
          喜欢新事物，新技术，对编程有浓厚兴趣，喜欢钻研。<br>
          想和有同样兴趣爱好的男生交朋友。<br>
          努力学习提升自己中...<br>

          <div @click="showHiddenAbout=!showHiddenAbout" title="彩虹" style="display:inline-block; cursor: pointer;">🌈</div>
          <br><br>

          <div :class="'imengyu-hidden-area float '+(showHiddenAbout?'show':'')">
            <code class="mb-3 display-inline-block">21/170/50/0</code><br>
            我好想要一个男朋友啊<br>
            不颜控，只求合得来真心的，不是非常喜欢10<br>
            一直期待能遇见你，我能陪着你一起<br>
            一起经历人生的种种冒险，把最好的都给你...<br>
            （我比较内向，刚开始可能不大会聊天，<br>
            成为你的男孩之后就会无话不说啦，另外是不是<br>
            两个内向的人在一起会有更多共同话语呢？）
          </div>
          <div :class="'imengyu-hidden-area-placeholder '+(showHiddenAbout?'show':'')">
          </div>

          
        </div>
      </div>

      <div class="imengyu-content-line" id="contact-me"></div>
      <!--联系-->
      <div class="imengyu-content-box-innern">
        
        <div class="imengyu-content-title text-black right imengyu-about-contact-title">
          CONTACT<br class="hide-sm"> ME
          <span>联系我</span>
        </div>
        <div class="imengyu-about-contact-list">
          <ul>
            <li>
              <i class="icon iconfont icon-youxiang"></i>
              <div class="sub">
                Mail
                <span><a href="mailto:yuzecheng@imengyu.top">yuzecheng@imengyu.top</a></span>
              </div>
            </li>
            <li>
              <i class="icon iconfont icon-yingdaicon04"></i>
              <div class="sub">
                WeChart
                <i class="iconfont icon-erweima-copy display-block position-relative" @mouseenter="showCode=true" @mouseleave="showCode=false">
                  <transition enter-active-class="zoomIn" leave-active-class="zoomOut">
                    <div v-show="showCode" class="imengyu-float-tip animated" :style="{width:'100px',height:'100px',left:'-50px',top:'-50px',animationDuration: '500ms'}">
                      <img src="../assets/images/wechart.jpg" :style="{width:'100px',height:'100px'}" />
                    </div>
                  </transition>
                </i>
              </div>
            </li>
            <li>
              <i class="icon iconfont icon-qq-copy"></i>
              <div class="sub">
                QQ
                <span>1501076885</span>
              </div>
            </li>
          </ul>
        </div>      

        <div class="hide-sm" style="height:40px"></div>
        <div class="imengyu-content-sub-title">
          <span>你看到了我的底线咯</span>     
        </div>
      </div>

      <RightCatalog ref="catalog" v-model="currentItem" :items="catalogItems" @item-click="onCatalogClicked" :scrollHostClassAddedEle="scrollEle">
      </RightCatalog>
    </div>
  </div> 
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import RightCatalog from '../components/RightCatalog.vue'

@Component({
  components: {
    RightCatalog
  }
})
export default class About extends Vue {

  showCode = false;
  showHiddenAbout = false;
  currentItem = '';
  catalogItems = [
    {
      text: 'ABOUT ME',
      id: 'about-me'
    },
    {
      text: 'MY SKILLS',
      id: 'my-skills'
    },
    {
      text: 'HELLO WORLD',
      id: 'hello-world'
    },
    {
      text: 'MORE ABOUT ME',
      id: 'more-about-me'
    },
    {
      text: 'CONTACT ME',
      id: 'contact-me'
    }
  ];
  scrollEle : HTMLElement = null;
  reloadScrollEle() {
    setTimeout(() => {
      this.scrollEle = document.getElementById('about-host');
    }, 200);
  }

  onCatalogClicked(item) {
    let el = document.getElementById(item.id);
    if(el) {
      this.scrollEle.scrollTo({
        top: el.offsetTop,
        behavior: "smooth" 
      })
    }
  }
  onGoWorks() {
    this.$router.push({name:'Works'})
  }

  @Watch('$route')
  onRouteChanged() {
    this.reloadScrollEle();
  }
  mounted() {
    this.reloadScrollEle();
    
  }
}


</script>