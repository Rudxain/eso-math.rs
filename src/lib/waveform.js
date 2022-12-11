import { TAU } from "../mod/const"
import { abs, sign } from "../mod/std"
import { floor } from "./rounding"
import { sqrt } from "./root"
import { mod } from "../mod/factors"

const { PI } = Math

/**
trigonometric sawtooth waveform
@param {number} x
*/
export const sawTrig = x => { x /= TAU; return (x - floor(x + 0.5)) * 2 }

/**
trigonometric triangular waveform
@param {number} x
*/
export const triangleTrig = x => abs(sawTrig(+x + PI / 2)) * 2 - 1

/**
trigonometric square waveform

defined as piecewise, because {@link Math.sign}({@link Math.sin}(x)) is inefficient
@param {number} x
*/
export const squareTrig = x => {
	x = mod(x, TAU) //normalize
	//is -0 returned correctly?
	return x && sign(PI - x)
}

/**
trigonometric semicircular cicloid waveform

@see https://math.stackexchange.com/a/1019099
@param {number} x
*/
export const circleTrig = x => {
	x = mod(x, TAU)
	const F = (/**@type {number}*/ x) => sqrt(1 - (x / (PI / 2) - 1) ** 2)
	return x < PI ? F(x) : -F(x - PI)
}

//missing periodic Gauss and arcsin, but It's not important