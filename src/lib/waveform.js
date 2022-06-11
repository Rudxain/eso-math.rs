/**
trigonometric sawtooth waveform
@param {number} x
@return {number}
*/
export const sawTrig = x => {x = x / TAU; return (x - floor(x + 0.5)) * 2}

/**
triangular
@param {number} x
@return {number}
*/
export const triangleTrig = x => abs(sawTrig(+x + PI / 2)) * 2 - 1

//square wave defined as piecewise
//because Math.sign(Math.sin(x)) is inefficient
export const squareTrig = x => {
	x = mod(x, TAU) //normalize
	//is -0 returned correctly?
	return x && sign(PI - x)
}

//https://math.stackexchange.com/a/1019099
//semicircular cicloid
export const circleTrig = x => {
	x = mod(x, TAU)
	const F = x => sqrt(1 - (x / (PI / 2) - 1) ** 2)
	return x < PI ? F(x) : -F(x - PI)
}
//missing periodic Gauss and arcsin, but It's not important