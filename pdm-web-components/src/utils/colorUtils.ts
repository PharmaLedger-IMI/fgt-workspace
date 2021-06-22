/**
 * @namespace Color
 * @memberOf Utils
 */

/**
 * Default callback color css variable
 * @memberOf Utils
 */
export const FALLBACK_COLOR = '--ion-color-primary;'

/**
 * color grades dates
 * @param threshold
 * @param currentVal
 * @param referenceVal
 * @memberOf Color
 */
export function parseDates (threshold, currentVal, referenceVal){
  const dayDiff = calculateDiffInDays(new Date(currentVal), referenceVal)
  if (dayDiff >= threshold)
    return FALLBACK_COLOR;
  return calculateStep(dayDiff, threshold);
}

/**
 * calculates a step
 * @param currentVal
 * @param referenceVal
 * @memberOf Color
 */
export function calculateStep(currentVal, referenceVal){
  let colorStep = 100;
  if (currentVal < referenceVal){
    const exactVal = Math.floor(currentVal/referenceVal * 100);
    colorStep = Math.floor(exactVal/5) * 5;
    colorStep = colorStep < 0 ? 0 : colorStep;
  }
  return `--color-step-${colorStep}`;
}

/**
 *
 * @param threshold
 * @param currentVal
 * @param referenceVal
 * @memberOf Color
 */
export function getSteppedColor(threshold, currentVal, referenceVal){
  if (referenceVal instanceof Date)
    return parseDates(threshold, currentVal, referenceVal);

  if (typeof currentVal !== typeof referenceVal){
    console.log(`invalid values received: ${currentVal} - ${referenceVal}`);
    return FALLBACK_COLOR;
  }

  const diff = referenceVal - currentVal;
  return calculateStep(diff, threshold);
}

/**
 *
 * @param current
 * @param reference
 * @memberOf Color
 */
export function calculateDiffInDays(current, reference){
  const timeDiff = current.getTime() - reference.getTime();
  return Math.floor(timeDiff/ (1000 * 3600 * 24));
}
