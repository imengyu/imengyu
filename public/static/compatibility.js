window.onload = function() {

  let browser = checkBrowserType();
  console.log('Your browser : ' + browser.type + '/' + browser.version);
  if(checkIsOldBrowser(browser)) 
    showErrorTip();
}

function checkIsOldBrowser(browser) {
  let version = splitVersion(browser.version);
  return browser.type == 'IE'
   || (browser.type == 'Chrome' && version < 55)
   || (browser.type == 'Opera' && version < 12)
   || (browser.type == 'Safari' && version < 5)
   || (browser.type == 'Firefox' && version < 15)
}
function showErrorTip() {
  let body = document.body;
  let box = document.createElement('div');
  body.appendChild(box);
  box.outerHTML = '<div style="z-index:3000;position:absolute;top:0;bottom:0;left:0;right:0;background-color:#fff;"><div style="display:inline-block;height:200px;width:400px;position:absolute;left:50%;top:50%;margin-top:-150px;margin-left:-200px;text-align:center"><h1>您的浏览器版本过低，无法正常显示本网页的内容</h1><span>建议更换最新版 <a href="https://www.google.cn/chrome" target="_blank">Google Chrome 浏览器</a> 或 关闭您浏览器的<b>兼容模式</b> </span></div></div>';
}
function checkBrowserType() {
  let userAgent = navigator.userAgent;
  let type = 'Unknow'
  let version = 'Unknow'
  let isOpera = userAgent.indexOf("Opera") > -1;  
  let agArr = userAgent.split(' ');
  let findversion = function(type) {
    for(let i=0;i<agArr.length;i++){
      if(agArr[i].indexOf(type)>-1 && agArr[i].indexOf('/')>-1){
        let ver = agArr[i].split('/');
        if(ver.length >= 2) return ver[1];
      }
    }
    return 'Unknow';
  }
 
  if (isOpera) {  
    type = 'Opera';
    version = findversion('Opera');
  }
  else if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {  
    type = 'IE';
    version = findversion('MSIE');
  }
  else if (userAgent.indexOf("Chrome") > -1){  
    type = "Chrome";
    version = findversion('Chrome');
  }
  else if (userAgent.indexOf("Safari") > -1) {  
    type = "Safari";
    version = findversion('Safari');
  }
  else if (userAgent.indexOf("Trident") > -1) {  
    type = "IE11/Edge";
    version = findversion('Trident');
  }
  else if (userAgent.indexOf("Firefox") > -1) {  
    type = "Firefox";
    version = findversion('Firefox');
  }
  return {
    type: type,
    version: version
  }
}
function splitVersion(verStr) {
  if(verStr.indexOf('.') > 0)
    return parseInt(verStr.split('.')[0]);
  return 0;
}