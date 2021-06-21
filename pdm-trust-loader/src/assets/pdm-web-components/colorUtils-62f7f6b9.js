/**
 * @namespace PdmWebComponents
 */
/**
 *
 */
const FALLBACK_COLOR = '--ion-color-primary;';
function parseDates(threshold, currentVal, referenceVal) {
  const dayDiff = calculateDiffInDays(new Date(currentVal), referenceVal);
  if (dayDiff >= threshold)
    return FALLBACK_COLOR;
  return calculateStep(dayDiff, threshold);
}
function calculateStep(currentVal, referenceVal) {
  let colorStep = 100;
  if (currentVal < referenceVal) {
    const exactVal = Math.floor(currentVal / referenceVal * 100);
    colorStep = Math.floor(exactVal / 5) * 5;
    colorStep = colorStep < 0 ? 0 : colorStep;
  }
  return `--color-step-${colorStep}`;
}
function getSteppedColor(threshold, currentVal, referenceVal) {
  if (referenceVal instanceof Date)
    return parseDates(threshold, currentVal, referenceVal);
  if (typeof currentVal !== typeof referenceVal) {
    console.log(`invalid values received: ${currentVal} - ${referenceVal}`);
    return FALLBACK_COLOR;
  }
  const diff = referenceVal - currentVal;
  return calculateStep(diff, threshold);
}
function calculateDiffInDays(current, reference) {
  const timeDiff = current.getTime() - reference.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
}

export { FALLBACK_COLOR as F, calculateDiffInDays as c, getSteppedColor as g };
