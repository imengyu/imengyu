<template>
  <div class="imengyu-text-network-graph">
    <canvas ref="canvas" @mousemove="onMouseMove($event)" @mouseleave="onMouseLeave" @mouseenter="onMouseEnter" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref, toRefs, watch } from 'vue'
import MathUtils from '../utils/MathUtils'
import { NetworkData, ComputedNetworkData } from './TextNetworkGraph'

export default defineComponent({
  name: 'TextNetworkGraph',
  props: {
    data: {
      type: Object as PropType<NetworkData>,
      required: true,
      default: null,
    },
    itemSpace: {
      type: Number,
      default: 100,
    },
  },
  setup(props) {

    const { data, itemSpace } = toRefs(props);
    const canvas = ref<HTMLCanvasElement>();

    let sizeCheckerInterval = 0;
    let moverInterval = 0;
    let checkLastWidth = 0;
    let checkLastHeight = 0;

    let animId = 0;
    let ctx : CanvasRenderingContext2D|null = null;
    let computedDataMap = new ComputedNetworkData();
    computedDataMap.degree = 90;

    onMounted(() => {
      setTimeout(() => {
        updatetCanvasSize();

        sizeCheckerInterval = setInterval(checkSizeChenged, 500);
        animId = requestAnimationFrame(render);

        const _canvas = canvas.value as HTMLCanvasElement;
        ctx = _canvas.getContext('2d');
        if(ctx) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#eee';
          ctx.font = '11px Arial';
        }

        setTimeout(() => {
          activeTree2(computedDataMap, true);
        }, 2000);
        buildAllDataMap();
      }, 200);
    });
    onBeforeUnmount(() => {
      clearInterval(moverInterval);
      clearInterval(sizeCheckerInterval);
      cancelAnimationFrame(animId);
    });

    //Canvas 大小检查
    function checkSizeChenged() {
      const _canvas = canvas.value as HTMLCanvasElement;
      if(checkLastWidth != _canvas.offsetWidth || checkLastHeight != _canvas.offsetHeight)
        updatetCanvasSize();
    }
    function updatetCanvasSize() {
      const _canvas = canvas.value as HTMLCanvasElement;
      _canvas.width = _canvas.offsetWidth;
      _canvas.height = _canvas.offsetHeight;
      checkLastWidth = _canvas.offsetWidth;
      checkLastHeight = _canvas.offsetHeight;

      //重置数据基础位置
      computedDataMap.positionX = _canvas.width / 2;
      computedDataMap.positionY = _canvas.height / 2 + _canvas.height / 8;
    }


    //构建数据图
    function buildAllDataMap() {
      if(data.value) {
        mouseHoverItemDatas = [];

        const { level } = buildDataMap(data.value, computedDataMap);
        buildDrawMap(computedDataMap, 0, level);
      }
    }
    //递归构建单个数据
    function buildDataMap(srcData: NetworkData, nowTargetData : ComputedNetworkData) {
      nowTargetData.name = srcData.name;
      nowTargetData.endButContinue = srcData.endButContinue ? true : false;
      nowTargetData.forceSpace = srcData.forceSpace ? srcData.forceSpace : 0;
      nowTargetData.forceDegree = srcData.forceDegree ? srcData.forceDegree : 0;
      nowTargetData.forceChildSpace = srcData.forceChildSpace ? srcData.forceChildSpace : 0;
      nowTargetData.forceUseableDegree = srcData.forceUseableDegree ? srcData.forceUseableDegree : 0;
      nowTargetData.children = [];
      nowTargetData.computedChildrenCount = 0;

      let nowLevel = 1;
      if(srcData.children)  {
        nowTargetData.computedChildrenCount = srcData.children.length;
        srcData.children.forEach((d) => {
          const newChild = new ComputedNetworkData();
          const { computedChildrenCount, level } = buildDataMap(d, newChild);
          newChild.parent = nowTargetData;
          nowTargetData.children.push(newChild);
          nowTargetData.computedChildrenCount += computedChildrenCount;
          nowLevel += level;
        })
      }
      return {
        computedChildrenCount: nowTargetData.computedChildrenCount,
        level: nowLevel,
      }
    }
    //递归构建单个绘制数据
    function buildDrawMap(nowData : ComputedNetworkData, level : number, allLevel : number) {

      const nowChildrenCount = nowData.children.length;
      const degreeOne = nowChildrenCount > 0 ? (1 / nowChildrenCount + 1) : 1;//均分比例  

      nowData.level = level;
      let nowDegree = nowData.degree;
      nowData.children.forEach((c) => {

        let degree = 0, nowDegreeSize = 360 * degreeOne;//当前占用角度
        degree = c.forceDegree > 0 ? c.forceDegree : (nowDegree + nowDegreeSize);//线的角度取中间

        //if(c.name === '后端开发') {
        //  console.log('a!');
        //}
        if(nowData.degree != 90 && Math.abs((degree - 180) % 360 - nowData.degree % 360) < 1) {
          degree += 45;
          nowDegreeSize += 45;
        }

        nowDegree += nowDegreeSize;
        c.degree = degree;

        //计算点坐标
        c.space = c.forceSpace > 0 ? 
          c.forceSpace : 
          (nowData.forceChildSpace > 0 ? nowData.forceChildSpace : getSpaceSize(c.computedChildrenCount, level, allLevel));
        c.positionY = nowData.positionY + Math.sin(MathUtils.d2r(degree)) * c.space;
        c.positionX = nowData.positionX + Math.cos(MathUtils.d2r(degree)) * c.space;

        mouseHoverItemDatas.push({
          x: c.positionX,
          y: c.positionY,
          data: c,
        });

        buildDrawMap(c, level + 1, allLevel);
      });
    }
    function getSpaceSize(computedChildrenCount : number, level : number, allLevel : number) {
      if(computedChildrenCount == 0) return itemSpace.value / 2;
      else return itemSpace.value + (computedChildrenCount / 10) * 40 + (level / allLevel) * 10;
    }

    let currentHoverData : ComputedNetworkData|null = null;
    let mouseHoverItemDatas = new Array<{
      x: number,
      y: number,
      data: ComputedNetworkData,
    }>();

    function onMouseEnter() { activeTree2(computedDataMap, false); }
    function onMouseLeave() { activeTree2(computedDataMap, true);  }
    function onMouseMove(e : MouseEvent) {

      const x = e.offsetX;
      const y = e.offsetY;

      for (let i = mouseHoverItemDatas.length - 1; i >= 0; i--) {
        const c = mouseHoverItemDatas[i];
        if(x > c.x - 10 && y > c.y - 5 && x < c.x + 10 && y < c.y + 5) {
          if(currentHoverData != c.data) {
            activeTree2(computedDataMap, false);
            currentHoverData = c.data;
            activeTree(currentHoverData, true);
          }
          return;
        }
      }
      activeTree2(computedDataMap, false);
      currentHoverData = null;
    }
    function activeTree(currentHoverData : ComputedNetworkData, active : boolean) {
      currentHoverData.active = true;
      currentHoverData.children.forEach((c) => c.active = true);
      while(currentHoverData.parent != null) {
        currentHoverData = currentHoverData.parent;
        currentHoverData.active = active;
      }
    }
    function activeTree2(data : ComputedNetworkData, active : boolean) {
      data.active = active;
      data.children.forEach((c) => activeTree2(c, active));
    }

    //渲染
    function render() {
      if(ctx) {

        ctx.clearRect(0, 0, checkLastWidth, checkLastHeight);
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
        ctx.font = '13px Arial';

        renderData(computedDataMap);
        animId = requestAnimationFrame(render);
      }
    }
    function renderData(nowData : ComputedNetworkData) {
      if(ctx) {

        for (let i = 0, c = nowData.children.length; i < c; i++) {
          const c = nowData.children[i];

          if(c.active) {
            if((nowData == computedDataMap || nowData.alpha >= 1) && c.alpha < 1)
              c.alpha += 0.1;
          } else {
            if((nowData == computedDataMap || nowData.alpha <= 0.2) && c.alpha > 0.2)
              c.alpha -= 0.1;
          }

          ctx.globalAlpha = c.alpha; 
          ctx.strokeStyle = '#ddd';
          ctx.moveTo(nowData.positionX, nowData.positionY);
          ctx.lineTo(c.positionX, c.positionY);
          ctx.stroke();
          ctx.globalAlpha = 1; 

          renderData(nowData.children[i]);
        }
        
        ctx.globalAlpha = nowData.alpha; 
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(nowData.positionX, nowData.positionY, ((6 - nowData.level) / 6 * 6) + 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1; 

        const textMeasure = ctx.measureText(nowData.name);
        ctx.globalAlpha = nowData.alpha; 
        ctx.fillStyle = (nowData.children.length == 0 || nowData != currentHoverData) ? '#222' : '#aaa';
        ctx.fillText(nowData.name, nowData.positionX - textMeasure.width / 2, nowData.positionY - 10);
        ctx.globalAlpha = 1; 
      }
    }

    watch(data, () => buildAllDataMap());

    return {
      canvas,
      onMouseMove,
      onMouseLeave,
      onMouseEnter,
    }
  }
})
</script>

<style lang="scss">
.imengyu-text-network-graph {
  display: block;
  position: relative;

  > canvas {
    width: 100%;
    height: 1100px;
  }
}

@media only screen and (max-width: 500px) {
  .imengyu-text-network-graph > canvas {
    height: 890px;
  }
}

</style>