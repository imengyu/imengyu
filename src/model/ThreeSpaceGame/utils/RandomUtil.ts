export function random(min: number, max: number) {
  return Math.floor(Math.random()*(max-min+1)+min);
}
export function randomBoolean(pec: number = 0.5) {
  return Math.random() < pec;
}
export function randomWithNegative(min: number, max: number) {
  let num = Math.floor(Math.random()*(max-min+1)+min);
  return Math.random() > 0.5 ? num : -num;
}