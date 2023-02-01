/* eslint-disable */

import { EventEmitter } from "@/utils/EventEmitter";

export type DrawSpectrumCallback = () => void;

export class CanvasGameProvider extends EventEmitter {

  protected ctx : CanvasRenderingContext2D|null = null;
  protected canvas : HTMLCanvasElement|null = null;
  protected drawSpectrumCallback : DrawSpectrumCallback|null = null;

  public switchSpectrum(on : boolean) : void {
    //Base function
  }
  public setDrawSpectrumCallback(drawSpectrumCallback : DrawSpectrumCallback|null) : void {
    this.drawSpectrumCallback = drawSpectrumCallback;
  }
  public drawSpectrum(analyser : AnalyserNode, voiceHeight : Uint8Array) : void {
    //Base function
  }

  public init(canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) : void {
    this.ctx = ctx;
    this.canvas = canvas;
  }
  public canPlayWithMusic() : boolean {
    return false;
  }
  public destroy() : void {
    //Base function
  }
  public render(deltatime : number) : void {
    //Base function
  }
  public start() : void {
    //Base function
  }
  public stop() : void {
    //Base function
  }
  public resize(w : number, h: number) : void {
    //Base function
  }
}