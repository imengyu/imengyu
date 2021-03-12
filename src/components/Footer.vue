<template>
  <div class="imengyu-copyright">
    <a href="javascript:;" @click="$emit('input', true)"><i class="iconfont icon-banquan"></i> 2021 imengyu 版权所有</a> | <a href="http://beian.miit.gov.cn/" target="blank">浙ICP备18051956号-2</a>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'Footer'
})
export default class Footer extends Vue {
  @Prop({default:false})value : boolean;
}
</script>