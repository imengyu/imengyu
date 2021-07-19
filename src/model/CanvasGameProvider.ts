export type DrawSpectrumCallback = () => void;
export class CanvasGameProvider {

  protected ctx : CanvasRenderingContext2D|null = null;
  protected canvas : HTMLCanvasElement|null = null;
  protected drawSpectrumCallback : DrawSpectrumCallback|null = null;

  public switchSpectrum(on : boolean) {
    //Base function
  }
  public setDrawSpectrumCallback(drawSpectrumCallback : DrawSpectrumCallback|null) {
    this.drawSpectrumCallback = drawSpectrumCallback;
  }
  public drawSpectrum(analyser : AnalyserNode, voiceHeight : Uint8Array) {
    //Base function
  }

  public init(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvas = canvas;
  }
  public destroy() {
    //Base function
  }
  public render(deltatime : number) {
    //Base function
  }
  public start() {
    //Base function
  }
  public stop() {
    //Base function
  }
  public resize(w : number, h: number) {
    //Base function
  }
}