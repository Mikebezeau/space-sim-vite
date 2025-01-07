import { CanvasTexture } from "three";
import { drawCircle, getCirclePoints } from "./drawUtil";

export const genCraterTexture = (
  canvas: HTMLCanvasElement,
  colors: { r: number; g: number; b: number }[],
  craterIntensity: number
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  const canvasBuffer = document.createElement("canvas");
  canvasBuffer.width = width;
  canvasBuffer.height = height;

  const ctxBuffer = canvasBuffer.getContext("2d");
  if (!ctxBuffer) return;
  ctxBuffer.filter = "blur(2px)";
  // Draw circles with random positions
  const craters: {
    thetaCenter: number;
    phiCenter: number;
    circleRadius: number;
  }[] = [];
  for (let i = 0; i < 100 * craterIntensity; i++) {
    const crater = {
      //thetaCenter: Math.random() * Math.PI,
      thetaCenter: Math.acos(1 - 2 * Math.random()),
      phiCenter: Math.random() * Math.PI * 2,
      circleRadius: Math.PI / (Math.floor(Math.random() * 40) + 30),
    };
    // do not include if close to poles
    if (
      !(
        crater.thetaCenter > Math.PI - crater.circleRadius / 2 ||
        crater.thetaCenter < crater.circleRadius / 2
      )
    ) {
      craters.push(crater);
    }
  }

  // craters are created by drawing circles within circles for different elevation
  // starting circle a bit small, to allow for blur to be fully visible if on edge
  //ctxBuffer.globalAlpha = 0.85;
  for (let e = 2; e >= 0; e--) {
    craters.forEach((crater) => {
      const pts = getCirclePoints(
        width,
        height,
        crater.thetaCenter,
        crater.phiCenter,
        crater.circleRadius * (1 - (4 - e) * 0.1)
      );
      drawCircle(
        pts,
        canvasBuffer,
        e == 2 ? colors[colors.length - 1] : colors[e]
      );
    });
  }
  ctx.globalAlpha = 0.5;
  ctx.drawImage(canvasBuffer, 0, 0);
  ctx.globalAlpha = 1;

  const canvasBumpMap = document.createElement("canvas");
  canvasBumpMap.width = width;
  canvasBumpMap.height = height;
  const ctxBumpMap = canvasBumpMap.getContext("2d");
  if (ctxBumpMap) {
    ctxBumpMap.filter = "grayscale(100%)";
    const neutralColor = colors[Math.min(Math.floor(colors.length * 0.5), 3)];
    ctxBumpMap.fillStyle = `rgb(${neutralColor.r}, ${neutralColor.g}, ${neutralColor.b})`;
    ctxBumpMap.fillRect(0, 0, width, height);
    ctxBumpMap.drawImage(canvasBuffer, 0, 0);
    // to test bump map
    //ctx.drawImage(canvasBumpMap, 0, 0);
  }
  return new CanvasTexture(canvasBumpMap);
};
