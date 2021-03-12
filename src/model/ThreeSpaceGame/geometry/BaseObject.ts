import { 
  Mesh,
  BufferGeometry,
  Material,
  Vector3,
} from "three";

export class BaseObject extends Mesh {

  public constructor(geometry?: BufferGeometry, material?: Material | Material[]) {
    super(geometry, material)
  }

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
}