import { 
  Vector3,
} from "three";

export class BaseObject {

  public velocity : Vector3 = new Vector3();
  public direction : Vector3 = new Vector3();

  public currentHex : number;

  public randSpeed = 1.0;
  public collected = false;
  public explodeTargetMaked = false;
  public explodeTargetArrived = false;
  public explodeTarget : Vector3 = new Vector3();
  public musicPosition : Vector3 = new Vector3();
  public musicPositionArrived = false;
  public musicTarget : Vector3 = new Vector3();

  public points : THREE.Points = null;
  public index = 0;
  public baseColor : THREE.Color = null;

  public BaseObject(index: number, baseColor: THREE.Color) {
    this.index = index;
    this.baseColor = baseColor;
  }

  private setColorByVal(o : number, v: number) {
    o *= v;
    if(o > 1) o = 1;
    else if(o < 0) o = 0;
    return o;
  }

  public set colorValue(val : number) {
    let colorArr =  this.points.geometry.getAttribute('color');
    colorArr.setXYZ(this.index, 
      this.setColorByVal(this.baseColor.r, val), 
      this.setColorByVal(this.baseColor.g, val), 
      this.setColorByVal(this.baseColor.b, val)
    )
    colorArr.needsUpdate = true; 
  }
  public set position(val : Vector3) {
    let posArr =  this.points.geometry.getAttribute('position');
    posArr.setXYZ(this.index, val.x, val.y, val.z)
    posArr.needsUpdate = true; 
  }
  public get position() : Vector3  {
    let posArr =  this.points.geometry.getAttribute('position');
    let baseIndex = this.index * 3;
    return new Vector3(posArr.array[baseIndex], posArr.array[baseIndex + 1], posArr.array[baseIndex + 2])
  }

}