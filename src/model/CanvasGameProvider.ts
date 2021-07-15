export type DrawSpectrumCallback = () => void;
export class CanvasGameProvider {

  protected ctx : CanvasRenderingContext2D;
  protected canvas : HTMLCanvasElement;
  protected drawSpectrumCallback : DrawSpectrumCallback = null;

  public switchSpectrum(on : boolean) {
  }
  public setDrawSpectrumCallback(drawSpectrumCallback : DrawSpectrumCallback) {
    this.drawSpectrumCallback = drawSpectrumCallback;
  }
  public drawSpectrum(analyser : AnalyserNode, voiceHeight : Uint8Array) {
  }

  public init(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvas = canvas;
  }
  public destroy() {

  }
  public render(deltatime : number) {

  }
  public start() {

  }
  public stop() {
    
  }
  public resize(w : number, h: number) {
    
  }
}