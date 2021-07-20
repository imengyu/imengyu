export default {
  d2r(degrees : number) : number {
    return degrees * (Math.PI / 180)
  },
  r2d(radians  : number) : number {
    return radians * (180 / Math.PI)
  }
}