<template>
  <div class="imengyu-main-host animated">
    <div class="imengyu-content-box full imengyu-works background-transparent" style="height:100%">

      <!--头-->
      <div class="imengyu-content-box-innern">
        <div class="display-inline-block imengyu-content-title left pb-0">
          MY WORKS
          <span>小生的作品和项目</span>
        </div>

        <WorkTab v-model:value="currentCategory" :items="categoryList">
        </WorkTab>
      </div>

      <HorList ref="horlist" :workItems="workItems" v-model:value="currentItem" :onePageCount="onePageCount">
        <template #end>
          <div class="info">
            <div class="con-mid">
              <h5>
                小生不才，只有这么多啦
                <br>正在努力做好更多作品
              </h5>
            </div>
          </div>
        </template>
      </HorList>

      <!--底-->
      <div style="height:40px"></div>
      <div class="imengyu-content-sub-title">
        <span>
          努力学习中
        </span>     
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HorList, { IHorList, IWorkItem } from '../components/HorList.vue'
import WorkTab from '../components/WorkTab.vue'

export default defineComponent({
  components: {
    HorList,
    WorkTab
  },
  data() {
    return {
      workItemsAll: [
        {
          id: 0,
          img: require('../assets/images/projects/17.jpg'),
          title: 'vue3-context-menu',
          text: '一个简洁美观简单的Vue3右键菜单组件',
          link: 'https://github.com/imengyu/vue3-context-menu',
          linkText: '查看更多',
          category: [ 'Web项目' ],
        },
        {
          id: 10,
          img: require('../assets/images/projects/7.png'),
          title: 'Ballance Rebuild',
          text: '一个曾经的经典滚球游戏复刻',
          link: 'https://github.com/imengyu/Ballance',
          linkText: '查看更多',
          category: [ '游戏' ],
        },
        {
          id: 2,
          img: require('../assets/images/projects/10.png'),
          title: 'Blueprint',
          text: '类似于 Unreal Engine 的蓝图脚本的设计软件(使用 Javascript 实现)',
          link: 'https://github.com/imengyu/node-blueprint',
          linkText: '查看更多',
          category: [ '应用和小程序' ],
        },
        {
          id: 1,
          img: require('../assets/images/projects/16.png'),
          title: 'VR720 安卓端720°全景浏览软件',
          text: 'A 720 Panorama viewer for Android<br>一个安卓端的720°全景图片/全景视频浏览软件',
          link: 'https://github.com/imengyu/VR720',
          linkText: '查看更多',
          category: [ '应用和小程序' ],
        },
        {
          id: 3,
          img: require('../assets/images/projects/5.png'),
          title: '一个 Java 开发的博客系统',
          text: 'Spring+MyBatis+MySQL+VUE,RestFul API<br> 目前仅自己使用',
          link: 'https://github.com/imengyu/FishBlog',
          linkText: '查看更多',
          category: [ 'Web项目' ],
        },
        {
          id: 4,
          img: require('../assets/images/projects/3.png'),
          title: '温州教育在线网站前台+后台系统（合作开发）',
          text: '基于PHP(Laravel), MySQL，Vue（nuxtjs）<br>www.wzjyzx.com',
          link: 'https://www.wzjyzx.com',
          linkText: '查看更多',
          category: [ 'Web项目' ],
        },
        {
          id: 5,
          img: require('../assets/images/projects/8.png'),
          title: '基于FFmpeg的屏幕录制程序',
          text: '一个基于FFmpeg使用 C# 、C++ 开发的最简单的屏幕录制软件',
          link: 'https://github.com/imengyu/ScreenRecoder',
          linkText: '查看更多',
          category: [ '应用和小程序' ],
        },
        {
          id: 7,
          img: require('../assets/images/projects/9.png'),
          title: '720度全景查看软件',
          text: '基于OpenGL的720度全景查看软件，使用C++编写<br>可快速打开并查看720度全景图像',
          link: 'https://github.com/imengyu/3DImageViewer',
          linkText: '查看更多',
          category: [ '应用和小程序' ],
        },
        {
          id: 8,
          img: require('../assets/images/projects/0.png'),
          title: 'ControlSwitch',
          text: 'STM32单片机，ESP8266+MQTT协议接入阿里云物联网平台 的一个自己制作的一个小电器，在自己家使里用',
          link: 'https://github.com/imengyu/ControlSwitch',
          linkText: '查看更多',
          category: [ '应用和小程序' ],
        },
        {
          id: 11,
          img: require('../assets/images/projects/2.png'),
          title: '',
          text: '网页设计1',
          link: '',
          linkText: '',
          category: [ '网页设计' ],
        },
        {
          id: 12,
          img: require('../assets/images/projects/13.png'),
          title: '',
          text: '网页设计2',
          link: '',
          linkText: '',
          category: [ '网页设计' ],
        },
        {
          id: 13,
          img: require('../assets/images/projects/11.png'),
          title: '',
          text: '网页设计3',
          link: '',
          linkText: '',
          category: [ '网页设计' ],
        },
        {
          id: 14,
          img: require('../assets/images/projects/6.png'),
          title: '我的个人主页',
          text: '就是你现在所在的这个网站了。这是自己玩玩的，结合了多个技术栈，但是功能上有很多不足，现在也更新好多次了',
          link: '',
          linkText: '',
          category: [ '网页设计' ],
        }, 
        {
          id: 15,
          img: require('../assets/images/projects/14.png'),
          title: '',
          text: 'WebGl动画设计1',
          link: '',
          linkText: '',
          category: [ '网页设计' ],
        },
        {
          id: 16,
          img: require('../assets/images/projects/12.png'),
          title: '',
          text: 'WebGl动画设计2',
          link: '',
          linkText: '',
          category: [ '网页设计' ],
        },
        {
          id: 17,
          img: require('../assets/images/projects/1.png'),
          title: '',
          text: 'ThreeJs动画',
          link: '',
          linkText: '',
          category: [ '网页设计' ],
        },
      
      ] as IWorkItem[],
      workItems: [
        
      ] as IWorkItem[],
      categoryList: [
        '全部',
        'Web项目',
        '应用和小程序',
        '游戏',
        '网页设计',
      ],
      currentItem: 0,
      currentCategory: "全部",
      onePageCount: 3,
    }
  },
  watch: {
    currentCategory() {
      this.currentItem = 0;
      this.loadWorkCategoryList();
    }
  },
  methods: {
    onWindowResize() {
      const w = window.outerWidth;
      if(w <= 500) this.onePageCount = 1;
      else if(w <= 800) this.onePageCount = 2;
      else this.onePageCount = 3;
      (this.$refs.horlist as IHorList).reloadListScroll();
    },
    loadWorkCategoryList() {
      let ix = 0;

      this.workItems.splice(0, this.workItems.length);
      this.workItemsAll.forEach((item) => {
        if(this.currentCategory == "全部" || item.category.indexOf(this.currentCategory) >= 0) {
          item.id = ix++;
          this.workItems.push(item);
        }
      });
    }

  },
  mounted() {
    setTimeout(() => {
      this.loadWorkCategoryList();
      this.onWindowResize();
    }, 200);

    window.addEventListener('resize', this.onWindowResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }
})
</script>