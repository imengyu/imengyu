
export function checkBrowserType() {
  var userAgent = navigator.userAgent;
  var type = 'Unknow'
  var version = 'Unknow'
  var isOpera = userAgent.indexOf("Opera") > -1;  
  var agArr = userAgent.split(' ');
  var findversion = function(type) {
    for(var i=0;i<agArr.length;i++){
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
  else if (userAgent.indexOf("Chrome") > -1){  
    type = "Chrome";
    version = findversion('Chrome');
  }
  else if (userAgent.indexOf("Safari") > -1) {  
    type = "Safari";
    version = findversion('Safari');
  }
  else if (userAgent.indexOf("Trident") > -1) {  
    type = "IE11/Edge";
    version = findversion('Trident');
  }
  else if (userAgent.indexOf("Firefox") > -1) {  
    type = "Firefox";
    version = findversion('Firefox');
  }
  return {
    type: type,
    version: version
  }
}
export function chromeVersion(verStr) {
  if(verStr.indexOf('.') > 0)
    return parseInt(verStr.split('.')[0]);
  return 0;
}