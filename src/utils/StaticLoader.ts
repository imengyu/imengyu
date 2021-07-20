//静态css 样式
const staticCss = [
  'animate.min.css',
  'iconfont.min.css'
] as Array<string>;
//静态js
const staticJs = [
] as Array<string>;

export function doLoadAll() : void { 
  staticCss.forEach((n) => doLoadCss(n));
  
  let loadJsCurrent = 0;
  const loadJs = () => {
    if(loadJsCurrent < staticJs.length) {
      doLoadJs(staticJs[loadJsCurrent], () => loadJs())
      loadJsCurrent++;
    }
  }

  loadJs();
}
export function doLoadCss(name : string) : void {
  const s = document.createElement("link");
  s.rel="stylesheet";
  s.type="text/css";
  s.href="./static/" + name;
  document.body.appendChild(s);
}
export function doLoadJs(name : string, callback : VoidFunction) : void {
  const script = document.createElement("script");
  script.onload = function() { callback(); };
  script.type="text/javascript";
  script.src="./static/" + name;
  document.body.appendChild(script);
}
