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
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
  name: 'RightCatalog'
})
export default class RightCatalog extends Vue {
  @Prop({default:null}) items : Array<any>;
  @Prop({default:null}) value;
  @Prop({default:null}) scrollHostClassAddedEle : HTMLElement;

  arrowH = 0;
  scrollHostClassAddedEleAdded : HTMLElement;

  @Watch("scrollHostClassAddedEle")
  onScrollHostClassAddedEleChanged() {
    if(this.scrollHostClassAddedEle != null)
      this.reloadScrollHost();
  }
  
  @Watch("value")
  onValue(v) {
    let currIdex = 0;
    for(let i = this.items.length - 1; i >= 0; i--) {
      if(this.items[i].id == v) {
        currIdex = i;
        break;
      }
    }
    this.arrowH = currIdex * 20 ;
  }
  @Watch("items")
  onItemsChange(v) {
    this.onScroll(null);
  }

  onGoItem(item) {
    this.$emit('item-click', item);
  }
  onScroll(ev : Event) {
    let top = this.scrollHostClassAddedEle.scrollTop;
    let height = this.scrollHostClassAddedEle.offsetHeight;
    let allheight = this.scrollHostClassAddedEle.scrollHeight;
    let el : HTMLElement = null;
    let activeItem = null;
    let item = null;
    if(this.items.length > 0) {
      if(top >= allheight - height) {
        activeItem = this.items[this.items.length - 1];
      }else for(let i = this.items.length - 1; i >= 0; i--) {
        item = this.items[i];
        if(item.el) {
          el = <HTMLElement>item.el;
          if(el.offsetTop >= top - height / 6) 
            activeItem = el;
          else break;
        }else {
          item.el = document.getElementById(item.id);
        }
      }
    }
    this.$emit('input', activeItem ? activeItem.id : null);
  }

  reloadScrollHost() {
  if(this.scrollHostClassAddedEleAdded != null) 
    this.scrollHostClassAddedEleAdded.removeEventListener('scroll', this.onScroll);
  
    if(this.scrollHostClassAddedEle) {
      this.scrollHostClassAddedEleAdded = this.scrollHostClassAddedEle;
      this.scrollHostClassAddedEle.addEventListener('scroll', this.onScroll);
    }
  }

  mounted() {
    setTimeout(() => {
      this.reloadScrollHost();
      if(this.scrollHostClassAddedEle != null) {
        this.onScroll(null);
        this.onScroll(null);
      }
    }, 500);
  }
  beforeDestroy() {
    if(this.scrollHostClassAddedEleAdded != null)
      this.scrollHostClassAddedEleAdded.removeEventListener('scroll', this.onScroll);
  }
}
</script>

<style lang="scss">
.imengyu-right-catalog {
  font-family: 'Engineer';
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