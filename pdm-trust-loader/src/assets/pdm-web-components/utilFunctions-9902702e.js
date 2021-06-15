/**
 *
 * @param str
 * @module Utils
 * @memberOf pdm-web-components
 */
function stringToBoolean(str) {
  if (typeof str === "boolean") {
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
 * @memberOf pdm-web-components
 */
const ionBreakpoints = {
  xs: 0,
  sm: 578,
  md: 768,
  lg: 992,
  xl: 1200
};
/**
 *
 * @param {function(string)} setter
 * @return {string} the current BreakPoint
 * @module Utils
 * @memberOf pdm-web-components
 */
function bindIonicBreakpoint(setter) {
  if (!window)
    throw new Error("This only works in a browser");
  const calcBreakPoint = function () {
    const breakPoints = Object.keys(ionBreakpoints);
    return breakPoints.reduce((accum, bp, i) => {
      if (i === 0)
        return accum;
      if (window.matchMedia(`(min-width: ${ionBreakpoints[bp]}px)`).matches)
        accum = bp;
      return accum;
    }, breakPoints[0]);
  };
  window.addEventListener('resize', (_) => {
    setter(calcBreakPoint());
  });
  return calcBreakPoint();
}

export { bindIonicBreakpoint as b, ionBreakpoints as i, stringToBoolean as s };
