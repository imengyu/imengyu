export default {
  randomNum(minNum : number, maxNum : number) : number {
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
  getSettings(key : string, defaultValue: string) : string {
    const v = localStorage.getItem(key);
    if(v) 
      return v;
    return defaultValue;
  },
  getSettingsBoolean(key : string, defaultValue : boolean) : boolean {
    const v = localStorage.getItem(key);
    if(v)
      return v == 'true';
    return defaultValue;
  },
  getSettingsNumber(key : string, defaultValue : number) : number {
    const v = localStorage.getItem(key);
    if(v) 
      return parseFloat(v);
    return defaultValue;
  },
  setSettingsNumber(key : string, value: number) : void {
    localStorage.setItem(key, value.toString());
  },
  setSettings(key : string, value: string) : void {
    localStorage.setItem(key, value);
  },
  setSettingsBoolean(key : string, value: boolean) : void {
    localStorage.setItem(key, value ? 'true' : 'false');
  },
};

/**
 * 将秒转换为 分:秒
 * @param s 秒数
*/
export function getTimeStringSec(s: string) : string {
  //计算分钟
  //算法：将秒数除以60，然后下舍入，既得到分钟数
  const h = Math.floor(parseInt(s) / 60);
  //计算秒
  //算法：取得秒%60的余数，既得到秒数
  s = Math.floor(parseInt(s) % 60).toString();
  //将变量转换为字符串
  let hS = h + '';
  let sS = s + '';
  //如果只有一位数，前面增加一个0
  hS = (hS.length == 1) ? '0' + hS : hS;
  sS = (sS.length == 1) ? '0' + sS : sS;
  return hS + ':' + sS;
}

