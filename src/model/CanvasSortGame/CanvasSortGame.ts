import { CanvasGameProvider } from "../CanvasGameProvider";
import Utils from "../../utils/Utils";

const DATA_LIGHT_TICK = 5;
const DATA_SLEET_TICK = 150;

export const SortMethodNames = [
  "bobble",
  "insertion",
  "selection",
  "quick",
  "shell",
  "merge",
  "heap",
  "radix",
];

export type SortMethods = ''|'spectrum'|"bobble"|"insertion"|"selection"|"quick"|"shell"|"merge"|"heap"|"radix";

const spectrum_width = 128;
const spectrum_line = 512;

export class CanvasSortGame extends CanvasGameProvider {
  public constructor() {
    super();
  }

  public changeSortMethod(method: SortMethods) : void {
    this.currentSortMethod = method;
    this.currentForceUseSortMethod = true;
    this.goGenData(true);
  }
  public switchSpectrum(on: boolean) : void {
    if (on) {
      this.resetStart();
      this.dataCount = spectrum_line;
      this.dataPool.splice(0, this.dataPool.length);
      for (let i = 0; i < this.dataCount; i++) this.dataPool.push(0);
      this.currentMode = "spectrum";
      this.currentSortMethod = "spectrum";
    } else this.goGenData();
  }
  public drawSpectrum(analyser: AnalyserNode, voiceHeight: Uint8Array) : void {
    analyser.getByteFrequencyData(voiceHeight);

    let step = Math.round(voiceHeight.length / spectrum_width);
    const lines = spectrum_width;

    const center = Math.ceil(lines / 2);
    const ha = this.dataCount;

    let h = 0;
    let index = 0;

    step = spectrum_line / spectrum_width;

    for (let i = 0; i < center; i++) {
      h = voiceHeight[step * (center - i)] / 250;

      for (let j = 0; j < step; j++) this.dataPool[index + j] = h * ha; //(h - ((h - lasth) * ((step - j) / step))) * this.dataCount;

      index += step;
    }
    for (let i = center; i < lines; i++) {
      h = voiceHeight[step * (i - center)] / 250;

      for (let j = 0; j < step; j++) this.dataPool[index + j] = h * ha; //(h - ((h - lasth) * ((step - j) / step))) * this.dataCount;

      index += step;
    }
  }

  public stop() : void {
    clearInterval(this.workInterval);
    this.workInterval = 0;
    this.resetStart();
  }
  public start() : void {
    if (this.workInterval != 0) clearInterval(this.workInterval);
    this.workInterval = setInterval(this.work.bind(this), 20);
  }

  private resetStart(forceMethod = false) {
    this.sorting = false;
    if (!forceMethod) this.currentSortMethod = "";
    this.sortStepRest();
  }

  private dataArrgenDataBuffer: Array<number> = [];
  private dataPool: Array<number> = [];

  private dataPoolAccess: Array<number> = [];
  private dataPoolSwap: Array<number> = [];
  private dataPoolSuccess: Array<number> = [];
  private dataPoolMoved: Array<number> = [];

  private workInterval = 0;
  public dataCount = 70;
  private maxHeight = 0.44;

  private currentForceUseSortMethod = false;

  public init(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) : void {
    super.init(canvas, ctx);
  }
  public destroy() : void {
    super.destroy();
    this.dataPool = [];
  }
  public render(deltatime: number) : void {
    super.render(deltatime);

    if (this.currentMode == "spectrum" && this.drawSpectrumCallback != null) {
      this.drawSpectrumCallback();
    }

    const ctx = this.ctx;
    if (ctx) {
      const sp = this.dataCount < 400;
      const h = ctx.canvas.height;
      let lineW = ctx.canvas.width / this.dataCount - (sp ? 2 : 1);
      let x = 0,
        sp2 = false,
        oh = 0;
      ctx.lineWidth = lineW;
      if (lineW < 1) {
        sp2 = true;
        lineW += 1;
      }
      for (let i = 0; i < this.dataCount; i++) {
        if (this.currentMode == "spectrum") ctx.fillStyle = "#aaa";
        else if (this.dataPoolSuccess[i] > 0) ctx.fillStyle = "#1a0";
        else if (this.dataPoolMoved[i] > 0) {
          this.dataPoolMoved[i]--;
          ctx.fillStyle = "#10a";
        } else if (this.dataPoolAccess[i] > 0) {
          this.dataPoolAccess[i]--;
          ctx.fillStyle = "#000";
        } else if (this.dataPoolSwap[i] > 0) {
          this.dataPoolSwap[i]--;
          ctx.fillStyle = "#a10";
        } else ctx.fillStyle = "#aaa";

        oh = (this.dataPool[i] / this.dataCount) * h * this.maxHeight;
        if (sp) x += 1;

        ctx.fillRect(x, h - oh, lineW, oh);

        x += lineW + (sp2 ? 0 : 1);
      }
    }
  }

  private sleepTick = 5;
  private currentMode:
    | "gen-data"
    | "sort-data"
    | "sleep"
    | "flash-data"
    | "spectrum" = "sleep";
  public currentSortMethod: SortMethods = "";
  private currentSortWorkTickCount = 1;

  private currentDataIndex = 0;
  private currentSortJumped = false;
  public sorting = false;

  private work() {
    if (this.currentMode == "sleep") {
      if (this.sleepTick > 0) this.sleepTick--;
      else this.goGenData();
    } else if (this.currentMode == "gen-data") {
      let b = true,
        i = 3;
      while (b && i > 0) {
        b = this.doGenData();
        i--;
      }
    } else if (this.currentMode == "flash-data") {
      let b = true,
        i = this.currentSortWorkTickCount;
      while (b && i > 0) {
        b = this.doFlashData();
        i--;
      }
    } else if (this.currentMode == "sort-data") {
      let i = this.currentSortWorkTickCount;
      while (i > 0) {
        if (this.sorting) this.sortContinue();
        i--;
      }
    }
  }

  //sleep

  private zeroSuccessData() {
    for (let i = 0; i < this.dataCount; i++) this.dataPoolSuccess[i] = 0;
  }
  private goSleep() {
    this.currentMode = "sleep";
    this.sleepTick = DATA_SLEET_TICK;
  }
  private goFlashData() {
    this.currentMode = "flash-data";
    this.currentDataIndex = 0;
  }
  private doFlashData() {
    if (this.currentDataIndex < this.dataCount) {
      this.dataPoolSuccess[this.currentDataIndex] = 1;
      this.currentDataIndex++;
      return true;
    } else {
      this.goSleep();
      setTimeout(() => {
        this.zeroSuccessData();
      }, 500);
    }
    return false;
  }

  //gen

  private goGenData(forceMethod = false) {
    this.resetStart(forceMethod);
    this.chooseNextSortMethod();

    this.currentMode = "gen-data";
    this.currentDataIndex = 0;

    this.dataPool.splice(0, this.dataPool.length);
    this.dataArrgenDataBuffer.splice(0, this.dataArrgenDataBuffer.length);

    for (let i = 0; i < this.dataCount; i++) this.dataPool.push(0);
    for (let i = 0; i < this.dataCount; i++) this.dataArrgenDataBuffer.push(i);
  }
  private doGenData() {
    if (this.currentDataIndex < this.dataCount) {
      const i = Utils.randomNum(0, this.dataArrgenDataBuffer.length - 1);
      this.dataPool[this.currentDataIndex] = this.dataArrgenDataBuffer[i];
      this.dataArrgenDataBuffer.splice(i, 1);
      this.currentDataIndex++;
      return true;
    } else this.goSortData();
    return false;
  }
  private chooseNextSortMethod() {
    if (this.currentForceUseSortMethod) this.currentForceUseSortMethod = false;
    else
      this.currentSortMethod = <SortMethods>(
        SortMethodNames[Utils.randomNum(0, SortMethodNames.length - 1)]
      );
    switch (this.currentSortMethod) {
      case "bobble":
        this.dataCount = 32;
        this.currentSortWorkTickCount = 1;
        break;
      case "insertion":
        this.dataCount = 64;
        this.currentSortWorkTickCount = 2;
        break;
      case "selection":
        this.dataCount = 64;
        this.currentSortWorkTickCount = 4;
        break;
      case "shell":
        this.dataCount = 512;
        this.currentSortWorkTickCount = 10;
        break;
      case "merge":
        this.dataCount = 256;
        this.currentSortWorkTickCount = 5;
        break;
      case "quick":
        this.dataCount = 512;
        this.currentSortWorkTickCount = 10;
        break;
      case "heap":
        this.dataCount = 256;
        this.currentSortWorkTickCount = 5;
        break;
      case "radix":
        this.dataCount = 512;
        this.currentSortWorkTickCount = 10;
        break;
    }
  }

  //sort

  private goSortData() {
    this.currentMode = "sort-data";
    this.sorting = true;
    switch (this.currentSortMethod) {
      case "bobble":
        this.bobbleSortStart();
        break;
      case "insertion":
        this.insertionSortStart();
        break;
      case "selection":
        this.selectionSortStart();
        break;
      case "shell":
        this.shellSortStart();
        break;
      case "merge":
        this.mergeSortStart();
        break;
      case "quick":
        this.quickSortSortStart();
        break;
      case "heap":
        this.heapSortSortStart();
        break;
      case "radix":
        this.radixSortStart();
        break;
      default:
        this.sorting = false;
        this.goSleep();
        break;
    }
  }

  private sortContinue() {
    if (this.currentSortJumped) {
      this.currentSortJumped = false;
      this.sortStepContinue();
    }
  }
  private endSort() {
    this.sorting = false;
    this.goFlashData();
  }

  //end

  private markAccess(a: number) {
    this.dataPoolAccess[a] = DATA_LIGHT_TICK;
  }
  private markSwap(a: number, b?: number) {
    this.dataPoolSwap[a] = DATA_LIGHT_TICK * 2;
    if (typeof b == "number") this.dataPoolSwap[b] = DATA_LIGHT_TICK * 2;
  }
  private markMoved(a: number) {
    this.dataPoolMoved[a] = DATA_LIGHT_TICK;
  }
  private doSwap(a: number, b: number) {
    this.dataPoolSwap[a] = DATA_LIGHT_TICK * 2;
    this.dataPoolSwap[b] = DATA_LIGHT_TICK * 2;

    [this.dataPool[a], this.dataPool[b]] = [this.dataPool[b], this.dataPool[a]];
  }

  //sort

  //ok
  private bobbleSortStart() {
    this.sortStepRest();
    this.currentSortJumped = true;
    this.bobbleSort(this.sortStepGetTempData());
  }
  private bobbleSort(arr: Array<number>) {
    const len = arr.length;
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len - 1 - i; j++) {
        this.sortStepAccess(j);
        this.sortStepAccess(j + 1);
        if (arr[j] > arr[j + 1]) {
          //相邻元素两两对比
          this.sortStepSwap(arr, j, j + 1);
        }
      }
    }
    return arr;
  }

  //ok
  private selectionSortStart() {
    this.sortStepRest();
    this.currentSortJumped = true;
    this.selectionSort(this.sortStepGetTempData());
  }
  private selectionSort(arr: Array<number>) {
    const len = arr.length;
    let minIndex;
    for (let i = 0; i < len - 1; i++) {
      minIndex = i;
      for (let j = i + 1; j < len; j++) {
        this.sortStepAccess(j);
        this.sortStepAccess(minIndex);
        if (arr[j] < arr[minIndex]) {
          //寻找最小的数
          minIndex = j; //将最小数的索引保存
        }
      }

      this.sortStepSwap(arr, i, minIndex);
    }
    return arr;
  }

  //ok
  private insertionSortStart() {
    this.sortStepRest();
    this.currentSortJumped = true;
    this.insertionSort(this.sortStepGetTempData());
  }
  private insertionSort(arr: Array<number>) {
    const len = arr.length;
    let preIndex, current;
    for (let i = 1; i < len; i++) {
      preIndex = i - 1;
      current = arr[i];
      this.sortStepSet(i, -1);

      while (
        preIndex >= 0 &&
        arr[preIndex] > current &&
        this.sortStepAccess(preIndex)
      ) {
        arr[preIndex + 1] = arr[preIndex];
        this.sortStepSet(preIndex + 1, arr[preIndex]);

        preIndex--;
      }

      arr[preIndex + 1] = current;
      this.sortStepSet(preIndex + 1, current);
    }
    return arr;
  }

  //ok
  private shellSortStart() {
    this.sortStepRest();
    this.currentSortJumped = true;
    this.shellSort(this.sortStepGetTempData());
  }
  private shellSort(arr: Array<number>) {
    const len = arr.length;
    let temp = 0,
      gap = 1;
    while (gap < len / 3) {
      //动态定义间隔序列
      gap = gap * 3 + 1;
    }
    for (gap; gap > 0; gap = Math.floor(gap / 3)) {
      for (let i = gap; i < len; i++) {
        temp = arr[i];

        this.sortStepSet(i, -1);
        let j = i - gap;
        for (; j >= 0 && arr[j] > temp; j -= gap) {
          arr[j + gap] = arr[j];
          this.sortStepAccess(j);
          this.sortStepSet(j + gap, arr[j]);
        }
        arr[j + gap] = temp;
        this.sortStepSet(j + gap, temp);
      }
    }
    return arr;
  }

  //ok

  private mergeSortStart() {
    this.sortStepRest();
    this.currentSortJumped = true;
    this.mergeSort(this.sortStepGetTempData());
  }
  private mergeSort(arr: Array<number>) {
    let i, next, left_min, left_max, right_min, right_max;
    const n = arr.length;
    //开辟一个与原来数组一样大小的空间用来存储用
    const temp = [];
    for (i = 0; i < n; i++) temp.push(0);

    //逐级上升，第一次比较2个，第二次比较4个，第三次比较8个。。。
    for (i = 1; i < n; i *= 2) {
      //每次都从0开始，数组的头元素开始
      for (left_min = 0; left_min < n - i; left_min = right_max) {
        right_min = left_max = left_min + i;
        right_max = left_max + i;
        //右边的下标最大值只能为n
        if (right_max > n) {
          right_max = n;
        }
        //next是用来标志temp数组下标的，由于每次数据都有返回到K，
        //故每次开始得重新置零
        next = 0;
        //如果左边的数据还没达到分割线且右边的数组没到达分割线，开始循环
        while (left_min < left_max && right_min < right_max) {
          this.sortStepAccess(left_min);
          this.sortStepAccess(right_min);
          if (arr[left_min] < arr[right_min]) {
            temp[next++] = arr[left_min++];
            this.sortStepSet(left_min, -1);
          } else {
            temp[next++] = arr[right_min++];
            this.sortStepSet(right_min, -1);
          }
        }
        //上面循环结束的条件有两个，如果是左边的游标尚未到达，那么需要把
        //数组接回去，可能会有疑问，那如果右边的没到达呢，其实模拟一下就可以
        //知道，如果右边没到达，那么说明右边的数据比较大，这时也就不用移动位置了

        while (left_min < left_max) {
          //如果left_min小于left_max，说明现在左边的数据比较大
          //直接把它们接到数组的min之前就行
          arr[--right_min] = arr[--left_max];

          this.sortStepSet(right_min, arr[left_max]);
        }
        while (next > 0) {
          //把排好序的那部分数组返回该k
          arr[--right_min] = temp[--next];

          this.sortStepSet(right_min, temp[next]);
        }
      }
    }
  }

  //nee step sort

  private sortSteps = new Array<{
    a: number;
    b: number;
    type: "swap" | "access" | "set";
  }>();
  private sortStepCurrent = 0;
  public sortStepPrecent = 0;

  public sortAccessCount = 0;
  public sortSwapCount = 0;

  private sortStepRest() {
    this.sortSteps.splice(0, this.sortSteps.length);
    this.sortStepCurrent = 0;
    this.sortStepPrecent = 0;
    this.sortAccessCount = 0;
    this.sortSwapCount = 0;
  }
  private sortStepContinue() {
    if (this.sortStepCurrent < this.sortSteps.length) {
      this.sortStepPrecent =
        (this.sortStepCurrent / this.sortSteps.length) * 100;
      const step = this.sortSteps[this.sortStepCurrent];
      if (step.type == "swap") {
        this.doSwap(step.a, step.b);
        this.sortSwapCount++;
      } else if (step.type == "set") {
        if (step.b == -1) this.markMoved(step.a);
        else if (step.b == -2) {
          this.markSwap(step.a);
          this.sortSwapCount++;
        } else {
          this.dataPool[step.a] = step.b;
          this.markSwap(step.a);
          this.sortSwapCount++;
        }
        this.sortAccessCount++;
      } else if (step.type == "access") {
        this.markAccess(step.a);
        this.sortAccessCount++;
      }

      this.currentSortJumped = true;
      this.sortStepCurrent++;
    } else {
      this.sortStepPrecent = 100;
      this.endSort();
    }
  }
  private sortStepSwap(arr: Array<number>, i: number, j: number) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
    this.sortSteps.push({
      a: i,
      b: j,
      type: "swap",
    });
    return true;
  }
  private sortStepAccess(i: number) {
    this.sortSteps.push({
      a: i,
      b: 0,
      type: "access",
    });
    return true;
  }
  private sortStepSet(i: number, v: number) {
    this.sortSteps.push({
      a: i,
      b: v,
      type: "set",
    });
    return true;
  }
  private sortStepGetTempData() {
    const arrTemp = [];
    for (let i = 0; i < this.dataCount; i++) arrTemp.push(this.dataPool[i]);
    return arrTemp;
  }

  //ok

  private quickSortSortStart() {
    this.sortStepRest();
    this.currentSortJumped = true;
    this.quickSort(this.sortStepGetTempData());
  }
  private quickSort(arr: Array<number>, left?: number, right?: number) {
    let partitionIndex;
    const _left = typeof left == "undefined" ? 0 : left;
    const _right = typeof right == "undefined" ? arr.length - 1 : right;

    if (_left < _right) {
      partitionIndex = this.quickSortPartition(arr, _left, _right);
      this.quickSort(arr, left, partitionIndex - 1);
      this.quickSort(arr, partitionIndex + 1, right);
    }
  }
  private quickSortPartition(arr: Array<number>, left: number, right: number) {
    //分区操作
    const pivot = left; //设定基准值（pivot）
    let index = pivot + 1;
    for (let i = index; i <= right; i++) {
      this.sortStepAccess(index);
      this.sortStepAccess(pivot);

      if (arr[i] < arr[pivot]) {
        this.sortStepSwap(arr, i, index);
        index++;
      }
    }

    this.sortStepSwap(arr, pivot, index - 1);
    return index - 1;
  }

  //ok

  private heapSortLength = 0;

  private buildMaxHeap(arr: Array<number>) {
    //建立大顶堆
    this.heapSortLength = arr.length;
    for (let i = Math.floor(this.heapSortLength / 2); i >= 0; i--) {
      this.heapify(arr, i);
    }
  }
  private heapify(arr: Array<number>, i: number) {
    //堆调整
    const left = 2 * i + 1,
      right = 2 * i + 2;
    let largest = i;

    if (
      left < this.heapSortLength &&
      arr[left] > arr[largest] &&
        this.sortStepAccess(left) &&
        this.sortStepAccess(largest)
    ) {
      largest = left;
    }
    if (
      right < this.heapSortLength &&
      arr[right] > arr[largest] &&
      this.sortStepAccess(right) &&
      this.sortStepAccess(largest)
    ) {
      largest = right;
    }

    if (largest != i) {
      this.sortStepSwap(arr, i, largest);
      this.heapify(arr, largest);
    }
  }
  private heapSort(arr: Array<number>) {
    this.buildMaxHeap(arr);
    for (let i = arr.length - 1; i > 0; i--) {
      this.sortStepSwap(arr, 0, i);
      this.heapSortLength--;
      this.heapify(arr, 0);
    }
    return arr;
  }
  private heapSortSortStart() {
    this.sortStepRest();
    this.currentSortJumped = true;
    this.heapSort(this.sortStepGetTempData());
  }

  //ok

  private radixSortCounter = [];

  private radixSortStart() {
    this.sortStepRest();
    this.currentSortJumped = true;
    this.radixSortCounter.splice(0, this.radixSortCounter.length);
    this.radixSort(
      this.sortStepGetTempData(),
      this.dataCount.toString().length
    );
  }
  private radixSort(arr: Array<number>, digit: number, radix = 10) {
    let i = 0,
      j = 0;
    const count = Array(radix), // 0~9的桶
      len = arr.length,
      bucket = Array(len);
    // 利用LSD,也就是次位优先
    for (let d = 0; d < digit; d++) {
      for (i = 0; i < radix; i++) {
        count[i] = 0;
      }
      // 向各个桶中添加元素,并统计出每个桶中装的个数
      for (i = 0; i < len; i++) {
        this.sortStepAccess(i);

        j = this.radixSortGetDigit(arr[i], d);
        count[j]++;
      }
      // count的越往后值最大,最大值为arr.length
      // count数组的值为,该位数值为该索引的数字总数
      for (i = 1; i < radix; i++) {
        count[i] = count[i] + count[i - 1];
      }
      // 按照桶的顺序将导入temp中
      for (i = len - 1; i >= 0; i--) {
        this.sortStepAccess(i);

        j = this.radixSortGetDigit(arr[i], d);
        bucket[count[j] - 1] = arr[i];

        this.sortStepSet(i, -1);
        count[j]--;
      }
      // 将已经根据相应位数排好的序列导回arr中
      for (i = 0; i < len; i++) {
        arr[i] = bucket[i];
        this.sortStepSet(i, bucket[i]);
      }
    }
    return arr;
  }
  private radixSortGetDigit(x: number, d: number) {
    const a = [
      1,
      10,
      100,
      1000,
      10000,
    ];
    return Math.floor(x / a[d]) % 10;
  }
}
