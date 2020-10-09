<template>
  <div class="imengyu-works-list-outer" @mousewheel="onMouseWhell($event)">
    <div class="imengyu-works-list-arrow left" :disabled="cannotBack" @click="listPrev()">
      <i class="iconfont icon-xiangzuo_o"></i>
    </div>
    <div class="imengyu-works-list" ref="worksList">

      <div class="work-item placeholder" :style="{ width: (itemWidth + 'px') }">
        <slot name="start" />
      </div>
      <div v-for="item in workItems" :key="item.id" 
        :class="'work-item animated'+(value==item.id?' active':'')+(Math.abs(value - item.id) < 2?'':' out')"
        :style="{ width: (itemWidth + 'px') }">
        <img :src="item.img">
        <div class="info">
          <h5>{{item.title}}</h5>
          <span v-html="item.text"></span>
        </div>
        <div v-if="item.link!=''" class="link">
          <a :href="item.link" target="_blank">{{item.linkText}}</a>
        </div>
        <div v-else class="link">
          <a>（＞人＜）暂时没有示例程序呢</a>
        </div>
      </div>
      <div class="work-item placeholder" :style="{ width: itemWidth + 'px' }">
        <slot name="end" />
      </div>

    </div>
    <div class="imengyu-works-list-arrow right" :disabled="cannotNext" @click="listNext()">
      <i class="iconfont icon-xiangzuo_o"></i>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
  name: 'HorList'
})
export default class HorList extends Vue {
  @Prop({default:null}) workItems : Array<any>;
  @Prop({default:null}) value;
  @Prop({default:3}) onePageCount;

  worksList : HTMLElement = null;
  itemWidth = 0;

  get cannotNext() {
    return !(this.value < this.workItems.length - 1)
  }
  get cannotBack() {
    return !(this.value > 0)
  }

  @Watch("onePageCount") 
  reloadItemWidth() {
    this.itemWidth = this.worksList.offsetWidth * (1/this.onePageCount) - 44;
  }
  
  @Watch("value") 
  reloadListScroll() {
    let w = (this.value + (this.onePageCount == 1 ? 1 : 0)) * this.worksList.offsetWidth / this.onePageCount;
    this.worksList.scrollTo({
      left: w,
      behavior: "smooth" 
    })
  }

  listNext() {
    if(this.value < this.workItems.length - 1)
      this.$emit('input', this.value + 1);
  }  
  listPrev() {
    if(this.value > 0)
      this.$emit('input', this.value - 1);
  }
 
  onMouseWhell(e : WheelEvent) {
    if(e.deltaY < 0) {
      this.listPrev();
    } else if(e.deltaY > 0) {
      this.listNext();
    }
    e.cancelBubble = true;
    e.preventDefault();
  }

  mounted() {
    setTimeout(() => {
      this.worksList = <HTMLElement>this.$refs.worksList;
      this.reloadItemWidth();
      setTimeout(() => this.reloadListScroll(), 100);
    }, 200);
  }

}

</script>
