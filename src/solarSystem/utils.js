export const rand = (min = 0, max = min + 1, rng) => {
  return rng() * (max - min) + min;
};

export const convert = {
  metric: {
    temp: (k) => k - 273.15,
    dist: (km) => km,
    weight: (kg) => kg,
  },
  empirical: {
    temp: (k) => 1.8 * (k - 273) + 32,
    dist: (km) => km / 1.609,
    weight: (kg) => kg * 2.205,
  },
};

convert.metric.temp.label = "°C";
convert.metric.dist.label = "km";
convert.metric.weight.label = "kg";

convert.empirical.temp.label = "°F";
convert.empirical.dist.label = "mi";
convert.empirical.weight.label = "lbs";
