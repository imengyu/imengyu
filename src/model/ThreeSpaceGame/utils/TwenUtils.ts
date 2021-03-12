

export function linearTween(min: number, max: number, now: number, maxSpeed: number, offStart : number, offEnd : number) {
  
  let minP = offStart * (max - min) + min;
  let maxP = max - offEnd * (max - min);

  if(now < minP && min < minP)
    return maxSpeed * ((now - min) / (minP - min));
  else if(now > maxP && maxP < max)
    return maxSpeed * ((max - now) / (max - maxP));

  return maxSpeed;
}