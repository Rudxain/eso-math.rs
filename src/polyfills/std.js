import {isInfNaN, isNegZero} from '../helper/value check'
import {toBigInt} from '../helper/sanitize'
import {abs, clamp} from '../lib/std'
import {expand} from '../lib/rounding'

//https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.signbit.js
Number.signbit = function(number) {
	return typeof number == 'number' &&
	number == number &&
	number < 0 || isNegZero(number)
}

Math.expand = function(x) {return expand(+x)}

/**
"KahanBabushkaKleinSum". Summation with minimal rounding errors
@param {number} values
@return {number}
*/
Math.sum = function(...values) {
	let sum = 0, cs = 0, ccs = 0, c = 0, cc = 0
	/*
	iterators can be replaced by using `ITERABLE.prototype[Symbol.iterator]`
	where "ITERABLE" can be an array, string, or any other object (it also allows adding an iterator)
	so `for ... of` loops must be avoided
	*/
	for (let i = 0; i < values.length; i++) {
		const v = +values[i]
		let t = sum + v
		c = abs(sum) >= abs(v) ? (sum - t) + v : (v - t) + sum
		sum = t; t = cs + c
		cc = abs(cs) >= abs(c) ? (cs - t) + c : (c - t) + cs
		cs = t; ccs = ccs + cc
	}
	return sum + cs + ccs
}

//BigInt methods don't have parameter display names, so using args makes it more vanilla
BigInt.sum = function() {
	let sum = 0n
	//avoid `reduce`
	for (let i = 0; i < arguments.length; i++)
		sum += toBigInt(arguments[i])
	return sum
}

Math.clamp = function(x, min, max) {return clamp(+x, +min, +max)}
BigInt.clamp = function(x, min, max) {return clamp(toBigInt(x), toBigInt(min), toBigInt(max))}

//https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/math-scale.js
//https://rwaldron.github.io/proposal-math-extensions/#sec-math.scale
Math.scale = function(x, inLow, inHigh, outLow, outHigh) {
	if (isInfNaN(x = +x)) return x
	inLow = +inLow; inHigh = +inHigh
	outLow = +outLow; outHigh = +outHigh
	return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow
}

export {Number, Math, BigInt}