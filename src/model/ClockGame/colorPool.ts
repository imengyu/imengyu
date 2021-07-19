
const colors = [
  'rgb(244, 67, 54)',
  'rgb(233, 30, 99)',
  'rgb(156, 39, 176)',
  'rgb(103, 58, 183)',
  'rgb(63, 81, 181)',
  'rgb(33, 150, 243)',
  'rgb(3, 169, 244)',
  'rgb(0, 188, 212)',
  'rgb(0, 150, 136)',
  'rgb(76, 175, 80)',
  'rgb(139, 195, 74)',
  'rgb(205, 220, 57)',
  'rgb(255, 235, 59)',
  'rgb(255, 193, 7)',
  'rgb(255, 152, 0)',
  'rgb(255, 87, 34)',
];

export function getColors() {
  return colors;
}
export function getColorByIndex(i : number) {
  if(i < colors.length) return colors[i];
  else return colors[(i % colors.length)];
}
export function getRandomColor() {
  const r = Math.floor(Math.random() * colors.length);
  return colors[r];
}
