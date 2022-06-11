import {abs} from '../lib/std'
import {TAU} from '../lib/const'

const {PI, sin: sine} = Math

/**
converts degrees to radians by default
@param {number} x
@param {number} [y=360] the input scale
@return {number}
*/
Math.toRadians = function(x, y = 360) {return TAU / +y * +x}
//scale = 360: degrees
//scale = 1: Tau radians

/**
converts radians to degrees by default
@param {number} x
@param {number} [y=360] the output scale
@return {number}
*/
Math.fromRadians = function(x, y = 360) {return +x / (TAU / +y)}

/**
bouncing sine waveform (periodic parabola)
@param {number} x
@return {number}
*/
Math.sinAbs = function(x) {return abs(sine((+x + PI / 3) / 2)) * 2 - 1}

export {Math}