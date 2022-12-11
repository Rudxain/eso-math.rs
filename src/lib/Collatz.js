import '../typedefs'
import {autoN, toNumeric} from '../mod/sanitize'
import {isOdd} from '../mod/std'
import {trunc} from './rounding'
import {trim} from '../mod/bitwise'
import {lcm} from '../mod/factors'

const Float = Number, Arr = Array

/**
generalized Collatz
https://en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations
@template {numeric} T
@template {fraction<T>} F
@param {{x: T, a: [F, F], b: [F, F], P: T}} kwargs arguments bag.
*/
export const Hailstone_general = function* (kwargs)
{
	let {x, a = [[1, 2], [3, 1]], b = [[0, 1], [1, 1]], P = 2} = kwargs
	P = trunc(P)

	/**
	add 2 fractions. format is [num, den]
	@param {fraction} f0 1st fraction
	@param {fraction} f1 2nd fraction
	@return {fraction} sum of input fracs
	*/
	const frac_sum = (f0, f1) => {
		const x = lcm(f0[1], f1[1])
		return [x / f0[1] * f0[0] + x / f1[1] * f1[0], x]
	}
	/**
	converts a fraction to its "binary" expansion form
	@param {fraction} f
	@return {numeric}
	*/
	const frac_to_num = f => f[0] / f[1]

	while (true){
		yield x
		const i = Float(x % P) ,
			//order matters, because of `IntN`s
			numerator = x * a.at(i)[0] / a.at(i)[1] ,
			f = frac_sum([numerator, 1], b.at(i))
		x = frac_to_num(f)
	}
}

/**
All known values that cause known cycles (trivial and non-trivial).
It's proven correct for all 32bit ints, but conjectured to be correct for all `numeric`als.
It's only proven correct for ints that satisfy `n <= 1n << 68n && n > -(1n << 33)`
@type {Set<numeric>}
*/
export const CYCLES = new Set([1, 1n, 0, 0n, -1, -1n, -5, -5n, -17, -17n, Infinity, -Infinity, NaN])

/**
The Collatz Fn. Applies 1 iteration of The Collatz Algorithm
@param {numeric} x number to apply fn
@return {numeric} next num in the Hailstone sequence
*/
export const Collatz_fn = x => isOdd(x = toNumeric(x)) ? autoN(3,x) * x + autoN(1,x) : x / autoN(2,x)

/**
Yields (Hailstone) seq of n. Supports signed integers.
@param {numeric} x seed
@param {boolean} skip_even
https://en.wikipedia.org/wiki/Collatz_conjecture
*/
export const Hailstone_std = function* (x, skip_even){
	x = toNumeric(x)
	while (true){
		if (skip_even) x = trim(x)
		yield x
		x = Collatz_fn(x)
	}
}

/**
additive sequence
@param {numeric} x seed
*/
export const Hailstone_add = function* (x){
	yield x = toNumeric(x)
	while (true) yield x += Collatz_fn(x)
}
