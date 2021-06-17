/**
 *
 * @param str
 * @module Utils
 * @memberOf pdm-web-components
 */
export function stringToBoolean(str){
  if(typeof str === "boolean"){
    return str;
  }
  if (typeof str === "string") {
    switch (str.toLowerCase().trim()) {
      case "true":
      case "1":
        return true;
      case "false":
      case "0":
      case null:
        return false;
      default:
        return Boolean(str);
    }
  }

  return Boolean(str);
}

/**
 * @module Utils
 */
export const ionBreakpoints = {
  xs: 0,
  sm: 578,
  md: 768,
  lg: 992,
  xl: 1200
}

/**
 *
 * @return {string} the current Ionic BreakPoint
 * @module Utils
 */
export function calcBreakPoint() {
  if (!window)
    throw new Error("This only works in a browser");

  const calcBreakPoint = function(){
    const breakPoints = Object.keys(ionBreakpoints);
    return breakPoints.reduce((accum, bp, i) => {
      if (i === 0)
        return accum;
      if (window.matchMedia(`(min-width: ${ionBreakpoints[bp]}px)`).matches)
        accum = bp;
      return accum;
    }, breakPoints[0]);
  }

  return calcBreakPoint();
}
