export const starTypes = {
  percentage: [76.45, 12.1, 7.6, 3.1, 0.61, 0.13, 0.01],
  class: ["M", "K", "G", "F", "A", "B", "O"],
  colorHex: [
    "#FE7600",
    "#FF8D23",
    "#FFDB94",
    "#FFF1D6",
    "#5297FF",
    "#0074FF",
    "#0023FF",
  ],
  colorRGB: [
    [254 / 255, 118 / 255, 0 / 255],
    [255 / 255, 141 / 255, 35 / 255],
    [255 / 255, 219 / 255, 148 / 255],
    [255 / 255, 247 / 241, 214 / 255],
    [82 / 255, 151 / 255, 255 / 255],
    [0 / 255, 116 / 255, 255 / 255],
    [0 / 255, 44 / 255, 255 / 255],
  ],
  size: [
    [0.5, 0.7],
    [0.7, 0.96],
    [0.96, 1.15],
    [1.15, 1.4],
    [1.4, 1.8],
    [1.8, 6.6],
    [6.6, 13.2],
  ],
  mass: [
    [0.08, 0.45],
    [0.45, 0.8],
    [0.8, 1.04],
    [1.04, 1.4],
    [1.4, 2.1],
    [2.1, 16],
    [16, 32],
  ],
};

export const STAR_DISPLAY_MODE = {
  unselected: 0,
  selected: 1, // doubles to select stars to show nebula particle sprite
  secondarySelected: 2,
  tertiarySelected: 3,
  dim: 4,
};
