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
          我是 imemgyu<br>
          学生，大三，在浙江杭州<br>
          普通的大学生，程序猿<br>
          正在努力学习工作<br>

          <div class="imengyu-about-subtitle">正在学习 <i class="iconfont icon-jiantou_xiangyouliangci_o"></i> </div>
          <div class="imengyu-about-small">
            Web 开发, App 开发, C, Java, Go, PHP, HTML5, <br>
            Javascript, Python, 机器学习, TensorFlow ...<br>
            51单片机, STM32单片机, Arduino, 树莓派, 物联网 ... <br>
          </div>
        </div>

        <img class="imengyu-about-big-image" width="200" src="../assets/images/about-photo.jpg" />
      
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
            <span class="subtitle">前端网页设计实现<br>官网设计 UI设计</span>
          </div>
          <div class="link-item">
            <i class="iconfont icon-wuliudanao_o"></i>
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

      <!--更多-->
      <div class="imengyu-content-box-innern" id="more-about-me">

        <div class="imengyu-content-sub-title">
          MORE ABOUT ME
          <span>
            更多关于我
            <a class="iconfont icon-biaoqing_xiao_o text-decoration-none" style="font-size:18px"></a>
          </span>
        </div>      

        <div class="imengyu-about-list show">
          <div class="item">
            <u class="title-prop">名字</u><span title="这就是我的真名">俞则成</span>。男生，学生/程序员
          </div>

          <div class="item">
            <u class="title-prop">家乡</u>浙江 
            <u class="ml-3 title-prop">星座</u><img src="../assets/images/libra.svg" title="天秤座" />
          </div>

          <div class="item">
            <u class="title-prop">爱好</u>编程、唱歌，绘画
            <u class="ml-3 title-prop">性格</u>安静，有点内向，做事认真
          </div>

          <div class="item">
            <u class="title-prop">学历</u><span title="温州科技职业学院">专科</span>
            <u class="ml-3 title-prop">专业</u>软件技术
          </div>

          <div class="imengyu-content-innern-subtitle">我是什么样的？</div>
          一个普通的男生，长相一般，内向，不善闲聊。<br>
          <span title="想要一个男朋友 21/170/50">🌈</span>。<br>
          喜欢新事物，新技术，对编程有浓厚兴趣，喜欢钻研。<br>
          想和有同样兴趣爱好的男生交朋友。<br>
          努力学习提升自己中...<br>

          <div class="imengyu-content-innern-subtitle">研究学习方向</div>
          全栈开发<br>
          数据科学<br>
          深度学习<br>
          
          <div class="imengyu-content-innern-subtitle">一直为了实现梦想而努力...</div>
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