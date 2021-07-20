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
import { defineComponent, PropType } from 'vue'

export interface IWorkItem {
  id: number,
  img: string,
  title: string,
  text: string,
  link: string,
  linkText: string,
  category: string[],
}

export interface IHorList {
  reloadListScroll: () => void;
}

export default defineComponent({
  name: 'HorList',
  props: {
    workItems: {
      type: Object as PropType<Array<IWorkItem>>,
      default: null,
    },
    value: {
      type: Number,
      default: 0,
    },
    onePageCount: {
      type: Number,
      default: 3,
    },
  },
  data() {
    return {
      worksList: null as HTMLElement|null,
      itemWidth: 0,
    }
  },
  computed: {
    cannotNext() : boolean {
      return !(this.value < this.workItems.length - 1)
    },
    cannotBack() : boolean {
      return !(this.value > 0)
    }
  },
  watch: {
    onePageCount() { this.reloadItemWidth() },
    value() { this.reloadListScroll() },
  },
  methods: {
    reloadItemWidth() {
      if(this.worksList)
        this.itemWidth = this.worksList.offsetWidth * (1 / this.onePageCount) - 40;
    },
    reloadListScroll() {
      if(this.worksList) {
        const w = (this.value + (this.onePageCount == 1 ? 1 : 0)) * this.worksList.offsetWidth / this.onePageCount;
        this.worksList.scrollTo({
          left: w,
          behavior: "smooth" 
        })
      }
    },
    listNext() {
      if(this.value < this.workItems.length - 1)
        this.$emit('update:value', this.value + 1);
    }  ,
    listPrev() {
      if(this.value > 0)
        this.$emit('update:value', this.value - 1);
    },
    onMouseWhell(e : WheelEvent) {
      if(e.deltaY < 0) {
        this.listPrev();
      } else if(e.deltaY > 0) {
        this.listNext();
      }
      e.cancelBubble = true;
      e.preventDefault();
    }
  },
  mounted() {
    setTimeout(() => {
      this.worksList = this.$refs.worksList as HTMLElement;
      this.reloadItemWidth();
      setTimeout(() => this.reloadListScroll(), 100);
    }, 200);
  }
})
</script>
