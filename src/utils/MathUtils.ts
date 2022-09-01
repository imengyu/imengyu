export default {
  d2r(degrees: number): number {
    return degrees * (Math.PI / 180)
  },
  r2d(radians: number): number {
    return radians * (180 / Math.PI)
  },
  //生成从minNum到maxNum的随机数
  randomNum(minNum?: number, maxNum?: number) : number {
    if (minNum !== undefined && maxNum !== undefined)
      return Math.round(Math.random() * (maxNum - minNum + 1) + minNum);
    if (minNum !== undefined)
      return Math.round(Math.random() * minNum + 1);
    return 0;
  },
}