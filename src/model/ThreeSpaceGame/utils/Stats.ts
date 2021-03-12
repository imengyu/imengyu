
/**
 * @author mrdoob / http://mrdoob.com/
 */

class Stats {

  mode = 0;
  container: HTMLElement = null;

  public constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
    this.container.addEventListener('click', (event) => {
      event.preventDefault();
      this.showPanel(++this.mode % this.container.children.length);
    }, false);

    this.domElement = this.container

    this.fpsPanel = this.addPanel(new Panel('FPS', '#0ff', '#002'));
    this.msPanel = this.addPanel(new Panel('MS', '#0f0', '#020'));

    if (self.performance && (<any>self.performance).memory) {
      this.memPanel = this.addPanel(new Panel('MB', '#f08', '#201'));
    }

    this.showPanel(0);
  }

  //

  addPanel(panel) {
    this.container.appendChild(panel.dom);
    return panel;
  }
  showPanel(id) {
    for (var i = 0; i < this.container.children.length; i++) {
      (<HTMLElement>this.container.children[i]).style.display = i === id ? 'block' : 'none';
    }
    this.mode = id;
  }

  //

  beginTime = (performance || Date).now();
  prevTime = this.beginTime;
  frames = 0;

  fpsPanel = null;
  msPanel = null;
  memPanel = null;

  REVISION: 16;

  public begin() {
    this.beginTime = (performance || Date).now();
  }

  public end() {
    this.frames++;
    var time = (performance || Date).now();
    this.msPanel.update(time - this.beginTime, 200);
    if (time >= this.prevTime + 1000) {

      this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);
      this.prevTime = time;
      this.frames = 0;

      if (this.memPanel) {
        var memory = (<any>performance).memory;
        this.memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
      }
    }

    return time;

  }

  public update() {
    this.beginTime = this.end();
  }

  // Backwards Compatibility

  domElement : HTMLElement;
  setMode = this.showPanel

};

class Panel {

  private min = Infinity
  private max = 0
  private context: CanvasRenderingContext2D;
  private PR = 0;
  private WIDTH = 0;
  private HEIGHT = 0;
  private TEXT_X = 0;
  private TEXT_Y = 0;
  private GRAPH_X = 0;
  private GRAPH_Y = 0;
  private  GRAPH_WIDTH = 0;
  private GRAPH_HEIGHT = 0;
  private bg = null;
  private fg = null;
  private canvas : HTMLCanvasElement = null;

  public constructor(name, fg, bg) {
    var round = Math.round;

    this.fg = fg;
    this.bg = bg;
    this.PR = round(window.devicePixelRatio || 1);
    this.WIDTH = 80 * this.PR;
    this.HEIGHT = 48 * this.PR,
    this.TEXT_X = 3 * this.PR;
    this.TEXT_Y = 2 * this.PR,
    this.GRAPH_X = 3 * this.PR
    this.GRAPH_Y = 15 * this.PR,
    this.GRAPH_WIDTH = 74 * this.PR;
    this.GRAPH_HEIGHT = 30 * this.PR;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.canvas.style.cssText = 'width:80px;height:48px';

    this.dom = this.canvas;

    this.context = this.canvas.getContext('2d');
    this.context.font = 'bold ' + (9 * this.PR) + 'px Helvetica,Arial,sans-serif';
    this.context.textBaseline = 'top';

    this.context.fillStyle = bg;
    this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    this.context.fillStyle = fg;
    this.context.fillText(name, this.TEXT_X, this.TEXT_Y);
    this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);

    this.context.fillStyle = bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
  }

  public dom: HTMLCanvasElement;

  public update(value, maxValue) {

    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
    this.context.fillStyle = this.fg;
    this.context.fillText(Math.round(value) + ' ' + name + ' (' + Math.round(this.min) + '-' + Math.round(this.max) + ')', this.TEXT_X, this.TEXT_Y);

    this.context.drawImage(this.canvas, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT);

    this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, Math.round((1 - (value / maxValue)) * this.GRAPH_HEIGHT));

  }

}

export { Stats as default };