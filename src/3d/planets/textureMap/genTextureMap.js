import { createNoise3D } from "simplex-noise";

// Function to parse a hex color string
const parseHexColor = (hex) => {
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
function rgbToHex(color) {
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

// Function to generate a random color within a range
function generateRandomColors(baseColor, factor) {
  const alterLum = (color, normfactor) => {
    return {
      r: Math.round(21.26 * normfactor + color.r),
      g: Math.round(71.52 * normfactor + color.g),
      b: Math.round(7.22 * normfactor + color.b),
    };
  };

  const { r, g, b } = baseColor;
  const colorArray = [
    { value: r, key: "r" },
    { value: g, key: "g" },
    { value: b, key: "b" },
  ];

  // Sort the color components by value in descending order
  colorArray.sort((a, b) => b.value - a.value);

  const newColors = [];

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
      newColor = alterLum(newColor, (Math.random() - 0.5) * 2);
      newColors.push(newColor);
    }
  }

  return newColors;
}

// Sort colors from darker to lighter
const sortColorArray = (colors) => {
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

// Function to interpolate between two RGB colors
const interpolateColor = (color1, color2, factor) => {
  //const r = Math.round(color1.r + factor * (color2.r - color1.r));
  //const g = Math.round(color1.g + factor * (color2.g - color1.g));
  //const b = Math.round(color1.b + factor * (color2.b - color1.b));
  const r = Math.round(color1.r + (color2.r - color1.r) * factor);
  const g = Math.round(color1.g + (color2.g - color1.g) * factor);
  const b = Math.round(color1.b + (color2.b - color1.b) * factor);
  return { r, g, b };
};

const get3dCoords = (x, y, width, height) => {
  const u = x / (width - 1);
  const v = y / (height - 1);
  const theta = 2 * Math.PI * u; // Longitude
  const phi = Math.PI * v; // Latitude
  const nx = Math.sin(phi) * Math.cos(theta);
  const ny = Math.sin(phi) * Math.sin(theta);
  const nz = Math.cos(phi);
  return { nx, ny, nz };
};

// Generate points for the circle
const drawCirclePoints = (
  ctx,
  textureWidth,
  textureHeight,
  centerLat = Math.PI / 2,
  centerLong = Math.PI,
  circleRadius = Math.PI / 16,
  color
) => {
  // Sphere circle parameters
  const numPoints = 100; // Number of points on the circle
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;

    // Compute 3D Cartesian coordinates of the circle
    const x =
      Math.sin(centerLat) * Math.cos(centerLong) +
      circleRadius * Math.cos(angle) * Math.cos(centerLong) -
      circleRadius *
        Math.sin(angle) *
        Math.sin(centerLat) *
        Math.sin(centerLong);
    const y =
      Math.sin(centerLat) * Math.sin(centerLong) +
      circleRadius * Math.cos(angle) * Math.sin(centerLong) +
      circleRadius *
        Math.sin(angle) *
        Math.sin(centerLat) *
        Math.cos(centerLong);
    const z =
      Math.cos(centerLat) +
      circleRadius * Math.sin(angle) * Math.cos(centerLat);

    // Convert back to spherical coordinates
    const theta = Math.acos(z / Math.sqrt(x * x + y * y + z * z));
    const phi = Math.atan2(y, x);

    // Convert spherical coordinates to texture (u, v)
    const u = (phi + Math.PI) / (2 * Math.PI);
    const v = 1 - theta / Math.PI;

    // Map (u, v) to texture pixel coordinates
    const px = Math.round(u * textureWidth);
    const py = Math.round(v * textureHeight);

    // paint the coordinates
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(px, py, 1, 1); // Draw a small rectangle to represent the point
  }
};

// Function to generate a seamless planet texture with enhanced noise scaling
export const generatePlanetTexture = (canvas, options = {}) => {
  const {
    width = canvas.width,
    height = canvas.height,
    scale = 1, // Adjust for finer detail
    octaves = 6,
    persistence = 0.5,
    grayscale = false,
    baseColor = "#102A44",
    debug = false,
  } = options;
  const debugData = {
    //noise: { min: Infinity, max: -Infinity },
    usedColors: {},
    normFactor: { min: Infinity, max: -Infinity },
    colorsSorted: [],
    circles: [],
  };
  const colors = generateRandomColors(parseHexColor(baseColor), 2);
  sortColorArray(colors);
  debugData.colorsSorted = colors;

  const ctx = canvas.getContext("2d");
  const noise3D = createNoise3D();
  const noiseValues = [];
  let minNoise = Infinity;
  let maxNoise = -Infinity;

  const mapToColor = (normValue, colors) => {
    if (!Array.isArray(colors) || colors.length < 2) {
      throw new Error("Invalid colors array");
    }
    let index = Math.floor(normValue * (colors.length - 2));
    const normFactor = normValue * (colors.length - 2) - index;
    debugData.normFactor.min = Math.min(debugData.normFactor.min, normFactor);
    debugData.normFactor.max = Math.max(debugData.normFactor.max, normFactor);
    debugData.usedColors[index] = debugData.usedColors[index]
      ? debugData.usedColors[index] + 1
      : 1;
    return interpolateColor(colors[index], colors[index + 1], normFactor);
  };

  // First pass: Calculate noise and track min/max
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { nx, ny, nz } = get3dCoords(x, y, width, height);
      let noiseValue = 0;
      let amplitude = 1;
      let frequency = scale;
      for (let o = 0; o < octaves; o++) {
        noiseValue +=
          noise3D(nx * frequency, ny * frequency, nz * frequency) * amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }
      noiseValues.push(noiseValue);
      minNoise = Math.min(minNoise, noiseValue);
      maxNoise = Math.max(maxNoise, noiseValue);
    }
  }

  // Second pass: Normalize and apply colors
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const noiseValue = noiseValues[y * width + x];
      const normalizedValue = (noiseValue - minNoise) / (maxNoise - minNoise);

      if (debug || grayscale) {
        const gray = Math.floor(normalizedValue * 255);
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      } else {
        const color = mapToColor(normalizedValue, colors);
        ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      }
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Draw circles with random positions
  for (let i = 0; i < 100; i++) {
    const centerLat = Math.random() * Math.PI;
    const centerLong = Math.random() * Math.PI * 2;
    const circleRadius = Math.PI / 16; //(Math.floor(Math.random() * 20) + 10); // Random radius between 10 and 30
    let randomColor = { r: 0, g: 0, b: 0 }; //colors[colors.length - 1];
    /*
    // if too close to top don't draw
    if (randomY + randomRadius > height - 20 || randomY - randomRadius < 20)
      continue;
    // if circle will go off 1 side, mirror to other side to draw other part of cirlce
    if (randomX + randomRadius > width || randomX - randomRadius < 0) {
      const mirroredX =
        randomX + randomRadius > width
          ? randomX - width // off left side
          : width + randomX; // off right side
    }
    */
    //drawCircle(ctx, width, height, randomX, randomY, randomRadius, randomColor);
    drawCirclePoints(
      ctx,
      width,
      height,
      centerLat,
      centerLong,
      circleRadius,
      randomColor
    );
  }
  console.log("generatePlanetTexture", debugData);
  return canvas;
};
