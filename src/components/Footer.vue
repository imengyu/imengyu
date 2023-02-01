<template>
  <div class="imengyu-copyright">
    <a href="javascript:;" @click="$emit('on-show-copyright')"><i class="iconfont icon-banquan"></i> 2023 快乐的梦鱼 版权所有</a> 
    | <a href="http://beian.miit.gov.cn/" target="blank">{{BeianNumber}}</a>
  </div>
</template>

<script lang="ts">
import Const from '@/const/Const'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Footer',
  emits: [ 'on-show-copyright' ],
  data() {
    return {
      BeianNumber: Const.BeianNumber
    }
  }
})
</script>