<template>
  <div class="imengyu-main">  

    <div class="imengyu-404">
      <div class="imengyu-404-box animated bounceInDown">
        <img src="../assets/images/404.svg" />
        <h1>Oh ! 404 Not found</h1>
        <span>没有找到你要的东西呢，说不定它被外星人掳走了...</span>
        
        <div class="imengyu-go-button animated fadeInLeft" @click="onBack">
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
import { Component, Vue, Prop } from 'vue-property-decorator'
import Footer from '../components/Footer.vue'
 
@Component({
  components: {
    Footer
  }
})
export default class NotFound extends Vue {
  onBack() {
    this.$router.push({ path: '/' });
  }
  mounted() {
    document.title = '404 Not found - 快乐的梦鱼 个人网站小作品';
    setTimeout(() => this.hideLoadingMask())
  }
  hideLoadingMask() {
    let loading = document.getElementById('imengyu-loading-mask');
    loading.classList.add('hide');
    setTimeout(() => {
      loading.style.display = 'none';
    }, 300)
  }
  
}
</script>

