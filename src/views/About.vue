<!-- eslint-disable vue/multi-word-component-names -->
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
          是一只小程序员<br>
          正在努力学习工作<br>

          <div class="imengyu-about-subtitle">LIFE <i class="iconfont icon-jiantou_xiangyouliangci_o"></i> </div>
          <div class="imengyu-about-small">
            人生太搞，梦想不老，<br>为了梦想，加油瞎搞<br>
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
          <span>我的技能</span>
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
          <div class="imengyu-go-button big animated fadeInLeft" @click="onGoWorks">
            <i class="iconfont icon-jiantou_yemian_xiangzuo_o"></i> More of My works
          </div>
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

          <div class="imengyu-content-innern-subtitle">主要擅长</div>
          前端开发，Vue、React，、Uniapp、RN、Flutter、Electron。<br>
          Unity 游戏开发，或者是H5小游戏，Cocos2d小游戏。<br>
          会画一点画（但好久没有深入学习了），喜欢唱歌（虽然很难听）。<br>
          初学摄影，目前拍的照片一般般。<br>
          
          <div class="imengyu-content-innern-subtitle">我是什么样的？</div>
          一个普通的男生，长相一般，内向，不善闲聊。<br>
          喜欢新事物，新技术，对编程有浓厚兴趣，喜欢钻研。<br>
          单身宅男，还没有对象。<br>
          ...<br>

          <div @click="showHiddenAbout=!showHiddenAbout" title="彩虹" class="display-inline-block cursor-pointer">🌈</div>
          <br><br>

          <div :class="'imengyu-hidden-area float '+(showHiddenAbout?'show':'')">
            <code class="mb-3 display-inline-block">21/170/50/0</code><br>
            找男朋友中，不颜控，真心的合得来就好，不是非常喜欢10。<br>
            是小m，喜欢蛮多东西，但不乱，是一个很正经的男孩子，<br>
            希望和未来的男朋友能有共同爱好，能一起玩就太好啦(/▽＼)<br>
            呜呜呜 (≧﹏ ≦)，我的男朋友你到底在哪里呀<br>
            一直期待能遇见你，我能陪着你一起<br>
            一起经历人生的种种冒险，把最好的都给你...<br>
          </div>
          <div :class="'imengyu-hidden-area-placeholder '+(showHiddenAbout?'show':'')">
          </div>
          
        </div>
      </div>

      <!--Learning-->
      <div class="imengyu-content-box-innern no-left-right-padding no-top-bottom-padding" id="learning">

        <div class="imengyu-content-sub-title">
          LEARNING MORE
          <span>
            学习永无止境<br>
            努力学习提升自己中
          </span>
        </div>      

        <TextNetworkGraph :data="learningData" />

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
                <span><a href="mailto:1501076885@qq.com">1501076885@qq.com</a></span>
              </div>
            </li>
            <li>
              <i class="icon iconfont icon-yingdaicon04"></i>
              <div class="sub">
                WeChart
                <i class="iconfont icon-erweima-copy display-block position-relative cursor-pointer" @click="showCode=true"></i>
              </div>
            </li>
            <li>
              <i class="icon iconfont icon-github"></i>
              <div class="sub">
                Github
                <span><a href="https://github.com/imengyu" target="_blank">https://github.com/imengyu</a></span>
              </div>
            </li>
          </ul>
        </div>      

        <div class="hide-sm" style="height:40px"></div>
        <div class="imengyu-content-sub-title">
          <span>你看到了我的底线咯</span>     
        </div>
      </div>

      <RightCatalog
        ref="catalog"
        class="animated fadeInDown"
        v-model:value="currentItem"
        :items="catalogItems"
        :scrollHostClassAddedEle="scrollEle || undefined"
        @item-click="onCatalogClicked" 
      />

      <!--微信二维码-->
      <AlertDialog v-model:show="showCode" title="WeChart" subTitle="扫一扫下面的二维码加我微信">

        <img src="../assets/images/wechart.jpg" :style="{width:'200px',height:'200px'}" />

        <div class="imengyu-content-line"></div>
        <div class="text-center">
          <div class="imengyu-go-button" @click="showCode=false">
            好哒
          </div>
        </div>

      </AlertDialog>

    </div>
  </div> 
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { getLearningData } from '../const/LearningData'
import RightCatalog, { RightCatalogItem } from '../components/RightCatalog.vue'
import TextNetworkGraph from '../components/TextNetworkGraph.vue'
import AlertDialog from '../components/AlertDialog.vue'

export default defineComponent({
  components: {
    RightCatalog,
    TextNetworkGraph,
    AlertDialog,
  },
  data() {
    return {
      showCode: false,
      showHiddenAbout: false,
      currentItem: '',
      catalogItems: [
        {
          text: 'ABOUT ME',
          id: 'about-me'
        },
        {
          text: 'MY SKILLS',
          id: 'my-skills'
        },
        {
          text: 'MORE ABOUT ME',
          id: 'more-about-me'
        },
        {
          text: 'LEARNING MORE',
          id: 'learning'
        },
        {
          text: 'CONTACT ME',
          id: 'contact-me'
        }
      ],
      learningData: getLearningData(),
      scrollEle: null as HTMLElement|null,
    }
  },
  methods: {
    reloadScrollEle() {
      setTimeout(() => {
        this.scrollEle = document.getElementById('about-host');
      }, 200);
    },
    onCatalogClicked(item : RightCatalogItem) {
      const el = document.getElementById(item.id);
      if(el && this.scrollEle) {
        this.scrollEle.scrollTo({
          top: el.offsetTop,
          behavior: "smooth" 
        })
      }
    },
    onGoWorks() {
      this.$router.push({name:'Works'})
    },
  },
  watch: {
    $route() {
      this.reloadScrollEle();
    }
  },
  mounted() {
    this.reloadScrollEle();
  }
})
</script>