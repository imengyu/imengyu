
export interface NetworkData {
  name: string;
  children?: NetworkData[];
  endButContinue?: boolean;
  forceChildSpace?:number;
  forceSpace?:number;
  forceDegree?:number;
  forceUseableDegree?:number;
}

export class ComputedNetworkData implements NetworkData {
  name = '';
  children: ComputedNetworkData[] = [];
  endButContinue = false;
  computedChildrenCount = 0;
  degree = 0;
  degreeTransOff = 0;
  degreeTransIsUp = false;
  degreeTransSpeed = 1;
  active = false;
  alpha = 1;
  level = 0;
  forceSpace = 0;
  forceChildSpace = 0;
  forceDegree = 0;
  forceUseableDegree = 0;
  positionX = 0;
  positionY = 0;
  space = 0;
  parent : ComputedNetworkData|null = null;
}