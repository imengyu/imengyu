<template>
  <div class="imengyu-text-network-graph">
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref, toRefs, watch } from 'vue'

export interface NetworkData {
  name: string;
  children?: NetworkData[];
  endButContinue?: boolean;
}

export class ComputedNetworkData implements NetworkData {
  name = '';
  children: NetworkData[] = [];
  endButContinue = false;
  computedChildrenCount = 0;
  degree = 0;
  useableDegreeStart = 0;
  useableDegreeEnd = 360;
}

export default defineComponent({
  name: 'TextNetworkGraph',
  props: {
    data: {
      type: Object as PropType<NetworkData>,
      required: true,
      default: null,
    }
  },
  setup(props) {

    const { data } = toRefs(props);
    const canvas = ref<HTMLCanvasElement>();

    let sizeCheckerInterval = 0;
    let checkLastWidth = 0;
    let checkLastHeight = 0;

    let animId = 0;
    let ctx : CanvasRenderingContext2D|null = null;

    onMounted(() => {
      setTimeout(() => {
        updatetCanvasSize();

        sizeCheckerInterval = setInterval(checkSizeChenged, 500);
        animId = requestAnimationFrame(render);

        const _canvas = canvas.value as HTMLCanvasElement;
        ctx = _canvas.getContext('2d');
        if(ctx) {
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '17px Arial';
        }

        buildAllDataMap();
      }, 200);
    });
    onBeforeUnmount(() => {
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
      const { width, height } = getComputedStyle(_canvas);
      _canvas.style.width = `${width}px`;
      _canvas.style.height = `${height}px`;
      checkLastWidth = _canvas.offsetWidth;
      checkLastHeight = _canvas.offsetHeight;
    }

    let computedDataMap = new ComputedNetworkData();

    //构建数据图
    function buildAllDataMap() {
      if(data.value) {
        buildDataMap(data.value, computedDataMap);
      }
    }
    //递归构建单个数据
    function buildDataMap(srcData: NetworkData, nowTargetData : ComputedNetworkData) {
      nowTargetData.name = srcData.name;
      nowTargetData.endButContinue = srcData.endButContinue ? true : false;
      nowTargetData.children = [];
      nowTargetData.computedChildrenCount = 0;
      if(srcData.children)  {
        srcData.children.forEach((d) => {
          const newChild = new ComputedNetworkData();
          nowTargetData.children.push(newChild);
          nowTargetData.computedChildrenCount += buildDataMap(d, newChild);
        })
      }
      return nowTargetData.computedChildrenCount
    }

    //渲染
    function render() {
      if(ctx) {
        ctx.clearRect(0, 0, checkLastWidth, checkLastHeight);

      }
    }

    watch(data, () => buildAllDataMap());

    return {
      canvas
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
    height: 500px;
  }
}

@media only screen and (max-width: 500px) {
  .imengyu-text-network-graph > canvas {
    height: 600px;
  }
}

</style>