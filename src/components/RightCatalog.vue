<template>
  <div class="imengyu-right-catalog">
    <div class="imengyu-catalog-arrow" :style="{top:arrowH+'px'}">
    </div>
    <ul>
      <li v-for="(item,i) in items" :key="i" @click="onGoItem(item)" :class="item.id==value?'active':''">
        {{ item.text }}
      </li>
    </ul> 
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export interface RightCatalogItem {
  id: string,
  el?: HTMLElement|null,
}

export default defineComponent({
  name: 'RightCatalog',
  props: {
    items: {
      type: Object as PropType<Array<RightCatalogItem>>,
      default: null
    },
    value: {
      type: String,
      default: ''
    },
    scrollHostClassAddedEle: {
      type: Object as PropType<HTMLElement>,
      default: null
    },
  },
  data() {
    return {
      arrowH: 0,
      scrollHostClassAddedEleAdded: null as HTMLElement|null,
    }
  },
  watch: {
    scrollHostClassAddedEle() {
      if(this.scrollHostClassAddedEle != null)
        this.reloadScrollHost();
    },
    value(v : string) {
      let currIdex = 0;
      for(let i = this.items.length - 1; i >= 0; i--) {
        if(this.items[i].id == v) {
          currIdex = i;
          break;
        }
      }
      this.arrowH = currIdex * 20 ;
    },
    items() {
      this.onScroll();
    }
  },
  methods: {
    onGoItem(item : RightCatalogItem) {
      this.$emit('item-click', item);
    },
    onScroll() {
      const top = this.scrollHostClassAddedEle.scrollTop;
      const height = this.scrollHostClassAddedEle.offsetHeight;
      const allheight = this.scrollHostClassAddedEle.scrollHeight;
      let el : HTMLElement|null = null;
      let activeItem : RightCatalogItem|null = null;
      let item : RightCatalogItem|null = null;
      if(this.items.length > 0) {
        if(top >= allheight - height) {
          activeItem = this.items[this.items.length - 1];
        }else for(let i = this.items.length - 1; i >= 0; i--) {
          item = this.items[i];
          if(item.el) {
            el = item.el as HTMLElement;
            if(el.offsetTop >= top - height / 6) 
              activeItem = el;
            else break;
          }else {
            item.el = document.getElementById(item.id);
          }
        }
      }
      this.$emit('update:value', activeItem ? activeItem.id : null);
    },
    reloadScrollHost() {
      if(this.scrollHostClassAddedEleAdded != null) 
        this.scrollHostClassAddedEleAdded.removeEventListener('scroll', this.onScroll);
      
      if(this.scrollHostClassAddedEle) {
        this.scrollHostClassAddedEleAdded = this.scrollHostClassAddedEle;
        this.scrollHostClassAddedEle.addEventListener('scroll', this.onScroll);
      }
    },
  },
  mounted() {
    setTimeout(() => {
      this.reloadScrollHost();
      if(this.scrollHostClassAddedEle != null) {
        this.onScroll();
        this.onScroll();
      }
    }, 500);
  },
  beforeUnmount() {
    if(this.scrollHostClassAddedEleAdded != null)
      this.scrollHostClassAddedEleAdded.removeEventListener('scroll', this.onScroll);
  }
})
</script>

<style lang="scss">
.imengyu-right-catalog {
  font-family: 'AaLGH';
  position: fixed;
  right: 25%;
  top: 45%;
  width: 140px;
  margin-right: -135px;

  .imengyu-catalog-arrow {
    display: inline-block;
    width: 0;
    height: 0;
    border-width: 10px;
    border-style: solid;
    border-color: transparent transparent transparent #fff;
    position: absolute;
    left: 0;
    top: 0;
    background-color: transparent;
  }

  ul {
    list-style: none;
    display: inline-block;
    padding: 0;
    margin: 0;

    li {
      display: block;
      text-align: left;
      cursor: pointer;
      user-select: none;
      line-height: 20px;
      font-size: 14px;
      height: 20px;
      padding-left: 10px;
      color: #575757;
      font-weight: 400;

      &.active {
        font-weight: 600;
      }
      &.active,
      &:hover {
        color: #000;
      } 
    }
  }
}

</style>