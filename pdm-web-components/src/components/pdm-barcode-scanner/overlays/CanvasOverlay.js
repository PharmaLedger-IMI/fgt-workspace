export default class CanvasOverlay {

  constructor(scannerContainer) {
    this.scannerContainer = scannerContainer;
    this.dimensions = this.getDimensions(this.scannerContainer);
  }

  getDimensions(scannerContainer) {
    let buttonHeight = 40;
    return {
      width: scannerContainer.offsetWidth,
      height: scannerContainer.offsetHeight,
      frame: 0.75 * Math.min(scannerContainer.offsetWidth, scannerContainer.offsetHeight) - buttonHeight
    }
  }

  addCanvasToView(canvasId, cssClass) {
    let canvasElement = document.createElement('canvas');
    canvasElement.id = canvasId;
    canvasElement.width = this.dimensions.width;
    canvasElement.height= this.dimensions.height;
    canvasElement.className = cssClass;
    canvasElement.style.position = 'absolute';
    canvasElement.style.width = '100%';
    canvasElement.style.top = '0';
    canvasElement.style.left = '0';

    this.scannerContainer.appendChild(canvasElement);
    return canvasElement;
  }
}
