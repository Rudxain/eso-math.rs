import '../typedefs'
import {toNumeric} from '../helper/sanitize'
import {trunc} from './rounding'
import {lcm} from './factors'

const Float = Number, Int = BigInt, Set_ = Set, Arr = Array

/**
generalized Collatz
https://en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations
@param {Object} kwargs arguments bag.
*/
export const Collatz_gen = function* (kwargs)
{
	let {n, a = [[1, 2], [3, 1]], b = [[0, 1], [1, 1]], P = 2} = kwargs
	n = toNumeric(n)
	a = Arr(a).map(x => Arr(x).map(toNumeric))
	b = Arr(b).map(x => Arr(x).map(toNumeric))
	P = trunc(toNumeric(P))

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

	yield n
	while (true){
		const i = Float(n % P),
			//order matters, because of `IntN`s
			numerator = n * a.at(i)[0] / a.at(i)[1]
			f = frac_sum([numerator, 1], b.at(i))
		yield n = frac_to_num(f)
	}
}

/**
Returns (Hailstone) seq of n. Supports signed integers.
@param {numeric} k steps. if unspecified, detects known cycles.
@param
Falsy s: Standard
Truthy s: "Shortcut" version
"Shortcut" is like Standard but skips some Even numbers
en.wikipedia.org/wiki/Collatz_conjecture
*/
export const Collatz_std = (n, k, s) => {
	n = n?.valueOf(); k = Float(k)
	const h = []
	if (typeof n == 'bigint')
	{
		h[h.length] = n
		const CYCLES = new Set_([1n, 0n, -1n, -5n, -17n])
		while (k ? h.length < k : !CYCLES.has(h.at(-1)))
			h[h.length] = h.at(-1) & 1n
				? (3n * h.at(-1) + 1n) / (s ? 2n : 1n)
				: h.at(-1) / 2n
	}
	else
	{
		h[h.length] = trunc(n)
		const CYCLES = new Set_([1, 0, -1, -5, -17, Infinity, -Infinity, NaN])
		while (k ? h.length < k : !CYCLES.has(h.at(-1)))
			h[h.length] = h.at(-1) % 2
				? (3 * h.at(-1) + 1) / (s ? 2 : 1)
				: h.at(-1) / 2
	}
	return h.slice(1)
}
//to-do: use remove all CTZ on shortcut mode

//additive seq
export const Collatz_add = function* (seed) {
	yield seed = Int(seed)
	while (true) yield seed += seed & 1n ? 3n * seed + 1n : seed >> 1n
}
