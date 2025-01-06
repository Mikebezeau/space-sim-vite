// Function to parse a hex color string
export const parseHexColor = (hex: string) => {
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
};

/*
// Function to convert RGB to hex color string
const rgbToHex = (color) => {
  const hex =
    "#" +
    [color.r, color.g, color.b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");
  console.log("rgbToHex", color, hex);
  return hex;
}
*/

// Sort colors from darker to lighter
const sortColorArray = (colors: { r: number; g: number; b: number }[]) => {
  colors.sort((colorA, colorB) => {
    const brightnessA = Math.sqrt(
      Math.pow(0.299 * colorA.r, 2) +
        Math.pow(0.587 * colorA.g, 2) +
        Math.pow(0.114 * colorA.b, 2)
    );
    const brightnessB = Math.sqrt(
      Math.pow(0.299 * colorB.r, 2) +
        Math.pow(0.587 * colorB.g, 2) +
        Math.pow(0.114 * colorB.b, 2)
    );
    return brightnessA - brightnessB;
  });
};

// Function to generate a random color within a range
export const generateSortedRandomColors = (
  isSun: boolean,
  baseColorHex: string /*, factor*/
) => {
  const baseColor = parseHexColor(baseColorHex);

  const alterLum = (
    color: { r: number; g: number; b: number },
    normfactor: number
  ) => {
    return {
      r: Math.round(21.26 * normfactor + color.r),
      g: Math.round(71.52 * normfactor + color.g),
      b: Math.round(7.22 * normfactor + color.b),
    };
  };

  const newColors: { r: number; g: number; b: number }[] = [];
  // for use when getting colors for a star, ensure that the
  // brightest color is white, and the other colors are on a range
  //if (isSun) newColors.push({ r: 255, g: 255, b: 255 });
  // from base to white
  const getFactorLumWhite = (color: { r: number; g: number; b: number }) => {
    // Calculate the normfactor needed to achieve pure white color
    const factorR = (255 - color.r) / 21.26;
    const factorG = (255 - color.g) / 71.52;
    const factorB = (255 - color.b) / 7.22;
    // Return the maximum factor to ensure all components reach 255
    return Math.max(factorR, factorG, factorB);
  };

  const { r, g, b } = baseColor;
  const colorArray = [
    { value: r, key: "r" },
    { value: g, key: "g" },
    { value: b, key: "b" },
  ];

  // Sort the color components by value in descending order
  colorArray.sort((a, b) => b.value - a.value);

  // default alterLum factor is -1 to 1
  // for suns, ensure that the brightest color is white
  const genAltLumFactor = () => {
    if (isSun) {
      const maxAltLumFactor = getFactorLumWhite(baseColor) + 0.2;
      const minAltLumFactor = -0.2;
      return (
        Math.random() * (maxAltLumFactor - minAltLumFactor) + minAltLumFactor
      );
    } else return Math.random() * 2 - 1;
  };

  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 6; i++) {
      //const adjustment = (Math.random() - 0.5) * 250 * factor;
      let newColor = { ...baseColor };
      /*
      const colorComponent = colorArray[Math.floor(i / 3)]; // 0-2: strongest, 3-4: second strongest, 5: weakest
      newColor[colorComponent.key] = Math.min(
        255,
        Math.max(0, colorComponent.value + adjustment)
      );
      */
      newColor = alterLum(newColor, genAltLumFactor());
      newColors.push(newColor);
    }
  }
  sortColorArray(newColors);
  return newColors;
};

// Function to interpolate between two RGB colors
const interpolateColor = (
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  factor: number
) => {
  //const r = Math.round(color1.r + factor * (color2.r - color1.r));
  //const g = Math.round(color1.g + factor * (color2.g - color1.g));
  //const b = Math.round(color1.b + factor * (color2.b - color1.b));
  const r = Math.round(color1.r + (color2.r - color1.r) * factor);
  const g = Math.round(color1.g + (color2.g - color1.g) * factor);
  const b = Math.round(color1.b + (color2.b - color1.b) * factor);
  return { r, g, b };
};

export const mapToColor = (
  normValue: number,
  colors: { r: number; g: number; b: number }[]
) => {
  if (!Array.isArray(colors) || colors.length < 2) {
    throw new Error("Invalid colors array");
  }
  let index = Math.floor(normValue * (colors.length - 2));
  const normFactor = normValue * (colors.length - 2) - index;
  /*
  debugData.normFactor.min = Math.min(debugData.normFactor.min, normFactor);
  debugData.normFactor.max = Math.max(debugData.normFactor.max, normFactor);
  debugData.usedColors[index] = debugData.usedColors[index]
    ? debugData.usedColors[index] + 1
    : 1;
  */
  return interpolateColor(colors[index], colors[index + 1], normFactor);
};

export const get3dCoords = (
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const u = x / (width - 1);
  const v = y / (height - 1);
  const theta = 2 * Math.PI * u; // Longitude
  const phi = Math.PI * v; // Latitude
  const nx = Math.sin(phi) * Math.cos(theta);
  const ny = Math.sin(phi) * Math.sin(theta);
  const nz = Math.cos(phi);
  return { nx, ny, nz };
};

// functions for circles starts here

// Function to compute 3D Cartesian coordinates for a circle in the local frame
const computeCircleInLocalFrame = (numPoints: number, radius: number) => {
  const points: [number, number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const x = Math.sin(radius) * Math.cos(angle); // X and Y determine the radius
    const y = Math.sin(radius) * Math.sin(angle);
    const z = Math.cos(radius); // Z is adjusted to maintain spherical shape
    points.push([x, y, z]);
  }
  return points;
};

// Function to apply rotations to position the circle on the sphere
const rotatePointToSphere = (
  point: [number, number, number],
  thetaCenter: number,
  phiCenter: number
) => {
  const [x, y, z] = point;

  // Step 1: Rotate around the Y-axis for latitude (thetaCenter)
  const x1 = x * Math.cos(thetaCenter) - z * Math.sin(thetaCenter);
  const z1 = x * Math.sin(thetaCenter) + z * Math.cos(thetaCenter);
  const y1 = y; // Y remains unchanged for latitude rotation

  // Step 2: Rotate around the Z-axis for longitude (phiCenter)
  const x2 = x1 * Math.cos(phiCenter) - y1 * Math.sin(phiCenter);
  const y2 = x1 * Math.sin(phiCenter) + y1 * Math.cos(phiCenter);
  const z2 = z1; // Z remains unchanged for longitude rotation

  return [x2, y2, z2];
};

// Function to compute the texture coordinates for a geodesic circle
export const getCirclePoints = (
  textureWidth: number,
  textureHeight: number,
  thetaCenter: number = Math.PI / 2,
  phiCenter: number = Math.PI,
  circleRadius: number = Math.PI / 16
) => {
  const numPoints = 20; // Number of points on the circle
  const textureCoordinates: [number, number][] = [];
  const localFramePoints = computeCircleInLocalFrame(numPoints, circleRadius);

  localFramePoints.forEach((point) => {
    const [x, y, z] = rotatePointToSphere(point, thetaCenter, phiCenter);

    // Convert Cartesian to spherical coordinates
    const radius = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.acos(z / radius); // Latitude
    const phi = Math.atan2(y, x); // Longitude

    // Convert spherical to texture coordinates
    const u = (phi + Math.PI) / (2 * Math.PI);
    const v = 1 - theta / Math.PI;
    // Map (u, v) to texture pixel coordinates
    const px = Math.round(u * textureWidth);
    const py = Math.round(v * textureHeight);

    // Store the coordinates
    textureCoordinates.push([px, py]);
  });
  return textureCoordinates;
};

const getCurvePoints = (
  points: [number, number][],
  tension = 0.5,
  isClosed = true,
  numOfSegments = 32
) => {
  var _pts: number[] = [],
    res: number[] = [], // clone array
    x: number,
    y: number, // our x,y coords
    t1x: number,
    t2x: number,
    t1y: number,
    t2y: number, // tension vectors
    c1: number,
    c2: number,
    c3: number,
    c4: number, // cardinal points
    st: number,
    t: number,
    i: number; // steps based on num. of segments
  const pts = points.reduce((acc: number[], point) => {
    acc.push(point[0], point[1]);
    return acc;
  }, []);
  // clone array so we don't change the original
  _pts = pts.slice(0);

  // **The algorithm requires an additional previous and end point to the actual point array**
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to beginning, end points to end
  if (isClosed) {
    _pts.unshift(pts[pts.length - 1]);
    _pts.unshift(pts[pts.length - 2]);
  }
  _pts.unshift(pts[1]); //copy 1. point and insert at beginning
  _pts.unshift(pts[0]);
  _pts.push(pts[pts.length - 2]); //copy last point and append
  _pts.push(pts[pts.length - 1]);

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1e point before and after
  for (i = 2; i < _pts.length - 4; i += 2) {
    for (t = 0; t <= numOfSegments; t++) {
      // calc tension vectors
      t1x = (_pts[i + 2] - _pts[i - 2]) * tension;
      t2x = (_pts[i + 4] - _pts[i]) * tension;

      t1y = (_pts[i + 3] - _pts[i - 1]) * tension;
      t2y = (_pts[i + 5] - _pts[i + 1]) * tension;
      // calc step
      st = t / numOfSegments;
      // calc cardinals
      c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
      c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
      c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
      c4 = Math.pow(st, 3) - Math.pow(st, 2);
      // calc x and y cords with common control vectors
      x = c1 * _pts[i] + c2 * _pts[i + 2] + c3 * t1x + c4 * t2x;
      y = c1 * _pts[i + 1] + c2 * _pts[i + 3] + c3 * t1y + c4 * t2y;
      //store points in array
      res.push(x);
      res.push(y);
    }
  }
  return res;
};

const drawLines = (ctx: any, pts: number[]) => {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length - 1; i += 2) {
    // thicken line according to normalized y position
    const normY = 1 - Math.abs(pts[i + 1] / ctx.canvas.height);
    ctx.lineWidth = Math.max(Math.sin(normY) * 4, 2);
    ctx.lineTo(pts[i], pts[i + 1]);
  }
  ctx.closePath();
  ctx.fill();
};

export const drawCircle = (
  pts: [number, number][],
  canvas: HTMLCanvasElement,
  color: { r: number; g: number; b: number }
) => {
  //const width = canvas.width;
  //const height = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // detect if the circle is positioned on the seam at left and right of texture map
  const isOnSeam =
    pts.some(([x, y]) => x < canvas.width / 4) &&
    pts.some(([x, y]) => x > canvas.width * 0.75);
  // paint the coordinates
  ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;

  // if isOnSeam create 2 circles, on the left and right of the texture map so that the curve is smooth when they meet
  if (isOnSeam) {
    // array format from getCirclePoints
    let newPts: [number, number][] = [];
    // array format for getCurvePoints
    let curvePoints: number[] = [];
    // left circle
    newPts = pts.map(([x, y]) => {
      if (x < canvas.width / 4) {
        return [canvas.width + x, y];
      }
      return [x, y];
    });
    curvePoints = getCurvePoints(newPts);
    drawLines(ctx, curvePoints);
    // right circle
    newPts = pts.map(([x, y]) => {
      if (x > canvas.width * 0.75) {
        return [x - canvas.width, y];
      }
      return [x, y];
    });
    curvePoints = getCurvePoints(newPts);
    drawLines(ctx, curvePoints);
    // add
  } else {
    //pts.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1)); // Draw point
    const curvePoints = getCurvePoints(pts);
    drawLines(ctx, curvePoints);
  }
};
