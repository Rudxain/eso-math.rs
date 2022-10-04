const { PI, abs, sin: sine } = Math, TAU = 2 * PI

/**
converts degrees to radians by default
@param {number} x
@param {number} [y=360] the input scale
*/
Math.toRadians = function (x, y = 360) { return TAU / +y * +x }
//scale = 360: degrees
//scale = 1: Tau radians

/**
converts radians to degrees by default
@param {number} x
@param {number} [y=360] the output scale
*/
Math.fromRadians = function (x, y = 360) { return +x / (TAU / +y) }

/**
bouncing sine waveform (periodic parabola)
@param {number} x
*/
Math.sinAbs = function (x) { return abs(sine((+x + PI / 3) / 2)) * 2 - 1 }

export { Math }