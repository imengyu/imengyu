import * as THREE from 'three';

/**
 * provide info on THREE.WebGLRenderer
 *
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
 */
class RendererStats	{

  private lastTime = Date.now();
  private msTexts	= [];

  public domElement: HTMLElement;
  
  public constructor() {
    var container	= document.createElement( 'div' );
    container.style.cssText = 'width:80px;opacity:0.9;cursor:pointer';

    var msDiv	= document.createElement( 'div' );
    msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#200;';
    container.appendChild( msDiv );

    var msText	= document.createElement( 'div' );
    msText.style.cssText = 'color:#f00;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
    msText.innerHTML= 'WebGLRenderer';
    msDiv.appendChild( msText );

    var nLines	= 9;
    for(var i = 0; i < nLines; i++){
      this.msTexts[i]	= document.createElement( 'div' );
      this.msTexts[i].style.cssText = 'color:#f00;background-color:#311;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
      msDiv.appendChild(this.msTexts[i]);
      this.msTexts[i].innerHTML= '-';
    }

    this.domElement = container;
  }
  public update(webGLRenderer){
    // sanity check
    console.assert(webGLRenderer instanceof THREE.WebGLRenderer)

    // refresh only 30time per second
    if(Date.now() - this.lastTime < 1000 / 30)	return;
    this.lastTime	= Date.now()

    var i	= 0;
    this.msTexts[i++].textContent = "[Memory]";
    this.msTexts[i++].textContent = "Programs: "	+ webGLRenderer.info.memory.programs;
    this.msTexts[i++].textContent = "Geometries: "+webGLRenderer.info.memory.geometries;
    this.msTexts[i++].textContent = "Textures: "	+ webGLRenderer.info.memory.textures;

    this.msTexts[i++].textContent = "[Render]";
    this.msTexts[i++].textContent = "Calls: "	+ webGLRenderer.info.render.calls;
    this.msTexts[i++].textContent = "Vertices: "	+ webGLRenderer.info.render.vertices;
    this.msTexts[i++].textContent = "Faces: "	+ webGLRenderer.info.render.faces;
    this.msTexts[i++].textContent = "Points: "	+ webGLRenderer.info.render.points;
  }
  
};

export default RendererStats;