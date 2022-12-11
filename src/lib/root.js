import { isInf } from '../mod/value check'
import { abs, sign } from '../mod/std'
import { sizeOf } from '../mod/bitwise'

const
	Float = Number, IntN = BigInt, RangeErr = RangeError,
	{ isNaN } = Float

/**
ith (degree i) root of x
@param {numeric} x
@param {numeric} i
@return {numeric}
*/
export const root = (x, i = 2) => {
	if (i == 1) return x

	if (typeof x == 'bigint') {
		i = IntN(i)

		if (i == -1n) return 1n / x

		if (!i) {
			if (x > 1n) throw new RangeErr('return value is NaN')
			return 0n
		}

		/**@type {bigint}*/
		const s = sign(x)
		x = abs(x)

		if (s === -1n && !(i & 1n))
			throw new RangeErr('return value is a Complex number')
		if (i < 0n) {
			if (!x) throw new RangeErr('return value is Infinity')
			return x === 1n ? s : 0n
		}

		if (x === 0n) return x

		if (x === 1n) return s === -1n ? s ** i : x

		//identity: a ^ (1 / k) = b ^ (log_b(a) / k)
		const j = i - 1n, lbx = sizeOf(x, 1n, 0n)

		//using the MSBs instead of generating a power of 2 is a better approximation
		/**@type {bigint}*/
		let
			x0 = x >> (lbx - lbx / i - 1n),
			x1 = (x0 * j + x / x0 ** j) / i

		//Heron/Newton/Babylonian Method, thanks to https://stackoverflow.com/a/30869049
		while (x1 < x0) {
			x0 = x1
			x1 = (x1 * j + x / x1 ** j) / i
		}
		return x0 * s
	}
	else //I hate the complexity of this entire fn
	{
		i = Float(i)
		if (isInf(x ** (1 / i))) return x ** (1 / i)
		if (isNaN(x) || isNaN(i)) return NaN
		if (i === -1) return 1 / x
		if (!i) return 0

		/**@type {number}*/
		const s = sign(x)
		x = abs(x)

		if (s === -1 && !(i % 2)) return NaN
		if (i < 0n) return x ? (x === 1 ? s : 0) : Infinity
		if (!x) return x
		if (x === 1) return s === -1 ? s ** i : x
		const j = i - 1
		let x1 = x ** (1 / i)
		if (x1 ** i != x) x1 = (x1 * j + x / x1 ** j) / i
		return x1 * s
	}
}
//I defined this dedicated (instead of just `root(x, 2)`) `sqrt` because of performance and bug concerns
/**
calculate square root
@template {numeric} T
@param {T} x
@return {T}
*/
export const sqrt = x => {
	if (typeof x != 'bigint')
		return x && x ** 0.5 //preserve `-0`

	if (x < 2n) {
		if (x < 0n) throw new RangeErr('return value is Complex number')
		return x
	}
	let
		x0 = x >> (sizeOf(x, 1n, 0n) >> 1n),
		x1 = (x / x0 + x0) >> 1n
	while (x1 < x0) {
		x0 = x1
		x1 = (x / x1 + x1) >> 1n
	}
	return x0
}

/**
calculate cubic root
@param {numeric} x
*/
export const cbrt = x => root(x, 3)