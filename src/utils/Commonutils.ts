import StringUtils from "./StringUtils";



/**
 * 检查是否定义
 * @param obj 
 */
function isDefined(obj : unknown) : boolean {
  return typeof obj !== 'undefined';
}
/**
 * 字符串判空
 * @param str 字符串
 */
function isNullOrEmpty(str : unknown) : boolean {
  return StringUtils.isNullOrEmpty(str);
}
/**
 * 判断是否定义并且不为null
 * @param v 要判断的数值
 */
function isDefinedAndNotNull(v : unknown) : boolean {
  return v != null && typeof v != 'undefined';
}

/**
 * 字符串转布尔
 * @param v 字符串
 */
function getBoolean(v : string) : boolean {
  return typeof v === 'string' && v.toLowerCase() === 'true' || v === '1';
}

/**
 * 生成随机字符串
 * @param len 随机字符串长度
 * @returns 随机字符串
 */
function randomString(len ?: number) : string {
  len = len || 32;
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}
/**
 * 生成随机字符串
 * @param len 随机字符串长度
 * @returns 随机字符串
 */
function randomNumberString(len ?: number) : string {
  len = len || 32;
  const $chars = '0123456789';
  const maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}
/**
 * 生成指定范围之内的随机数
 * @param minNum 最小值
 * @param maxNum 最大值
 */
function genRandom(minNum : number, maxNum : number) : number {
  return Math.floor(Math.random()*(maxNum-minNum+1)+minNum); 
}
/**
 * 生成不重复随机字符串
 * @param randomLength 字符长度
 */
function genNonDuplicateID(randomLength : number) : string {
  let idStr = Date.now().toString(36)
  idStr += Math.random().toString(36).substr(3,randomLength)
  return idStr
}
/**
 * 生成不重复随机字符串
 * @param randomLength 字符长度
 */
function genNonDuplicateIDHEX(randomLength : number) : string {
  const idStr = genNonDuplicateID(randomLength);
  return StringUtils.strToHexCharCode(idStr, false).substr(idStr.length - randomLength, randomLength);
}

export default {
  isDefined,
  isNullOrEmpty,
  isDefinedAndNotNull,
  getBoolean,
  randomString,
  randomNumberString,
  genRandom,
  genNonDuplicateID,
  genNonDuplicateIDHEX,
}