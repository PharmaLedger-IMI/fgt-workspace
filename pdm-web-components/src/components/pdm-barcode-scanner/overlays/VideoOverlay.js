import CanvasOverlay from './CanvasOverlay';

const ANGLE_WIDTH = 50;

export default class VideoOverlay extends CanvasOverlay {

  constructor(scannerContainer, videoSource) {
    super(scannerContainer);
    this.videoSource = videoSource;
    let dimensions = this.dimensions;
    let xPadding = (dimensions.width - dimensions.frame) / 2;
    let yPadding = (dimensions.height - dimensions.frame) / 2;
    this.cropOptions = [xPadding, yPadding, dimensions.frame, dimensions.frame];
  }

  getCropOptions() {
    return this.cropOptions;
  }

  createOverlaysCanvases(lensCanvas, overlayCanvas) {
    this.lensCanvas = this.addCanvasToView(lensCanvas, 'barcode-scanner-lens');
    this.overlayCanvas = this.addCanvasToView(overlayCanvas, 'barcode-scanner-overlay');
  }

  removeOverlays() {
    try{
      this.scannerContainer.removeChild(this.lensCanvas);
      this.scannerContainer.removeChild(this.overlayCanvas);
    }catch(err){
      // we are not in dom any more
    }
  }

  drawOverlay(points) {
    let x1, y1, x2, y2;

    if (points.length >= 2) {
      x1 = points[0].x;
      y1 = points[0].y;

      x2 = points[1].x;
      y2 = points[1].y;
    }

    let isLine = x1 + y1 + x2 + y2 === 0;

    this.overlayCanvas.width = this.dimensions.width;
    this.overlayCanvas.height = this.dimensions.height;

    let xPadding = this.cropOptions[0];
    let yPadding = this.cropOptions[1];
    let frameWidth = this.cropOptions[2];

    if (this.overlayCanvas.getContext) {
      let ctx = this.overlayCanvas.getContext('2d');
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(72, 217, 96, 0.4)';
      ctx.fillStyle = 'rgba(72, 217, 96, 0.4)';

      ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
      ctx.beginPath();

      if (isLine) {
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      } else {
        const gap = 60;
        const size = frameWidth - 2 * gap;
        ctx.rect(xPadding + gap, yPadding + gap, size, size);
      }

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgb(72, 217, 96)';

      this.addLensCorners(ctx, xPadding, yPadding, frameWidth, ANGLE_WIDTH);

      setTimeout(() => {
        ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
      },500);
    }
  }

  drawLensCanvas() {
    let ctx = this.lensCanvas.getContext('2d');
    let dimensions = this.dimensions;
    let polygonPoints = [
      [0, 0],
      [dimensions.width, 0],
      [dimensions.width, dimensions.height],
      [0, dimensions.height]
    ];
    let xPadding = (dimensions.width - dimensions.frame) / 2;
    let yPadding = (dimensions.height - dimensions.frame) / 2;
    let frameWidth = dimensions.frame;
    let holePoints = [
      [xPadding, yPadding],
      [xPadding, yPadding + frameWidth],
      [xPadding + frameWidth, yPadding + frameWidth],
      [xPadding + frameWidth, yPadding]
    ];

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    ctx.beginPath();
    ctx.moveTo(polygonPoints[0][0], polygonPoints[0][1]);
    ctx.lineTo(polygonPoints[1][0], polygonPoints[1][1]);
    ctx.lineTo(polygonPoints[2][0], polygonPoints[2][1]);
    ctx.lineTo(polygonPoints[3][0], polygonPoints[3][1]);
    ctx.lineTo(polygonPoints[0][0], polygonPoints[0][1]);
    ctx.closePath();

    ctx.moveTo(holePoints[0][0], holePoints[0][1]);
    ctx.lineTo(holePoints[1][0], holePoints[1][1]);
    ctx.lineTo(holePoints[2][0], holePoints[2][1]);
    ctx.lineTo(holePoints[3][0], holePoints[3][1]);
    ctx.lineTo(holePoints[0][0], holePoints[0][1]);
    ctx.closePath();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();

    this.addLensCorners(ctx, xPadding, yPadding, frameWidth, ANGLE_WIDTH);
  }

  addLensCorners(ctx, xPadding, yPadding, frameWidth, angleWidth) {
    ctx.beginPath();

    // top-left corner
    ctx.moveTo(xPadding, yPadding + angleWidth);
    ctx.lineTo(xPadding, yPadding);
    ctx.lineTo(xPadding + angleWidth, yPadding);

    // top-right corner
    ctx.moveTo(xPadding + frameWidth - angleWidth, yPadding);
    ctx.lineTo(xPadding + frameWidth, yPadding);
    ctx.lineTo(xPadding + frameWidth, yPadding + angleWidth);

    // bottom-right corner
    ctx.moveTo(xPadding + frameWidth - angleWidth, yPadding + frameWidth);
    ctx.lineTo(xPadding + frameWidth, yPadding + frameWidth);
    ctx.lineTo(xPadding + frameWidth, yPadding + frameWidth - angleWidth);

    // bottom-left corner
    ctx.moveTo(xPadding, yPadding + frameWidth - angleWidth);
    ctx.lineTo(xPadding, yPadding + frameWidth);
    ctx.lineTo(xPadding + angleWidth, yPadding + frameWidth);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255)';
    ctx.stroke();
  }
}
