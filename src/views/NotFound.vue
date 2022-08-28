<template>
  <div class="imengyu-main">  

    <div class="imengyu-404">
      <div class="imengyu-404-box animated bounceInDown">
        <img src="../assets/images/404.svg" />
        <h1>Oh ! 404 Not found</h1>
        <span>没有找到你要的东西呢，说不定它被谁偷走了...</span>
        
        <div class="imengyu-go-button big animated fadeInLeft" @click="onBack">
          <i class="iconfont icon-jiantou_yemian_xiangzuo_o"></i>
          返回主页
        </div>
      </div>
    </div>

    <!--脚-->
    <Footer />
  </div>
</template>

<script lang="ts">
import Footer from '../components/Footer.vue'
import { defineComponent } from 'vue'
import Const from '@/const/Const';

export default defineComponent({
  name: '秒数',
  components: {
    Footer,
  },
  methods: {
    onBack() {
      this.$router.push({ path: '/' });
    },
    hideLoadingMask() {
      const loading = document.getElementById('imengyu-loading-mask');
      if(loading) {
        loading.classList.add('hide');
        setTimeout(() => {
          loading.style.display = 'none';
        }, 300)
      }
    }
  },
  mounted() {
    document.title = '404 Not found - ' + Const.SiteName;
    setTimeout(() => this.hideLoadingMask())
  }
})
</script>

