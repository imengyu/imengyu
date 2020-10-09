export default {
  randomNum(minNum : number, maxNum : number) {
    switch (arguments.length) {
      case 1:
        return Math.floor(Math.random() * minNum + 1);
      case 2:
        return Math.floor(Math.random() * (maxNum - minNum + 1) + minNum);
      default:
        return 0;
    }
  },
  getTimeStringSec,
  getSettings(key : string, defaultValue) {
    let v = localStorage.getItem(key);
    if(v) 
      return v;
    return defaultValue;
  },
  getSettingsBoolean(key : string, defaultValue : boolean) {
    let v = localStorage.getItem(key);
    if(v)
      return v == 'true';
    return defaultValue;
  },
  getSettingsNumber(key : string, defaultValue : number) {
    let v = localStorage.getItem(key);
    if(v) 
      return parseFloat(v);
    return defaultValue;
  },
  setSettings(key : string, value) {
    localStorage.setItem(key, value);
  },
};

/**
 * 将秒转换为 分:秒
 * s int 秒数
*/
export function getTimeStringSec(s: string) {
  //计算分钟
  //算法：将秒数除以60，然后下舍入，既得到分钟数
  var h;
  h = Math.floor(parseInt(s) / 60);
  //计算秒
  //算法：取得秒%60的余数，既得到秒数
  s = Math.floor(parseInt(s) % 60).toString();
  //将变量转换为字符串
  h += '';
  s += '';
  //如果只有一位数，前面增加一个0
  h = (h.length == 1) ? '0' + h : h;
  s = (s.length == 1) ? '0' + s : s;
  return h + ':' + s;
}

