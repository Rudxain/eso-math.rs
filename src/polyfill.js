/**
# Related
- [BigInt Math TC39 proposal](https://github.com/tc39/proposal-bigint-math)
- [Math Extensions proposal](https://github.com/rwaldron/proposal-math-extensions)
*/

import { isNumber as isFloat } from './helper/type check'
import { isInt, isInfNaN } from './helper/value check'
import { toBigInt as toIntN } from './helper/sanitize'
import { PHI, MAX64 } from './lib/const'
import { abs, sign, logB } from './lib/std'
import { trunc } from './lib/rounding'
import { ctz, popCount, sizeOf } from './lib/bitwise'
import {M as nthMersenne} from '../lib/Mersenne'
import { sqrt } from './lib/root'
import { gcd, lcm } from './lib/factors'
import { Gosper, Gamma, Lanczos } from './lib/factorial'

import defProp from '../helper/defProp'
{
	const
		IntN = BigInt, Float = Number,
		TypeErr = TypeError, RangeErr = RangeError,
		{ log2: lb, sin: sine, random: RNG } = Math

	/**https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/lang/Double.html#MIN_NORMAL*/
	Float.MIN_NORMAL = 2 ** -1022
	Math.TAU = 2 * Math.PI
	Math.SQRT5 = Math.sqrt(5)
	Math.PHI = PHI

	IntN.MAX_UINT64 = MAX64
	IntN.MAX_INT64 = MAX64 >> 1n
	IntN.MIN_INT64 = -1n << 63n


	Math.logB = function (x, y = E) { return logB(+x, +y) }

	Math.LOG2PHI = lb(PHI); Math.LNPHI = Math.log(PHI); Math.LOG10PHI = Math.log10(PHI)

	Math.logPHI = function (x) { return logB(+x, PHI) }

	Math.LOGPHI2 = Math.logPHI(2); Math.LOGPHIE = Math.logPHI(E); Math.LOGPHI10 = Math.logPHI(10)

	Math.SQRT3 = sqrt(3)
	Math.LN3 = Math.log(3); Math.LOG2_3 = lb(3)
	Math.LOG10_3 = Math.log10(3); Math.LOGPHI3 = Math.logPHI(3)
	//ternary lives also matter
	Math.log3 = function (x) { return logB(+x, 3) }
	//stop discriminating the number 3
	Math.LOG3_2 = Math.log3(2); Math.LOG3E = Math.log3(E)
	Math.LOG3_10 = Math.log3(10); Math.LOG3PHI = Math.log3(PHI)
	//join The Order of The Triangle Of Power: https://youtu.be/sULa9Lc4pck

	//lb(bigint)
	IntN.log2 = function (n) {
		if ((n = toIntN(n)) > 0n) return sizeOf(n, 1n, 0n)
		throw new RangeErr('Non-positive logarithmation')
	}

	//3 is the closest integer to `E`
	IntN.logB = function (n, b = 3n) {
		n = toIntN(n); b = toIntN(b)
		if (n < 1n || b < 2n) throw new RangeErr('return value is -Infinity or NaN')
		return logB(n, b)
	}

	/**
	All the integer division defnitions
	@param {bigint} n numerator | dividend
	@param {bigint} d denominator | divisor
	@param {string} F function or variant
	@return {bigint} quotient
	*/
	IntN.div = function (n, d, F) {
		n = toIntN(n); d = toIntN(d)
		const q = n / d
		//this could be wrong when using "euclid"
		if (!(n % d)) return q
		const s = (n < 0n) != (d < 0n) ? 1n : 0n //XOR of sign bits
		switch (String(F).trim().toLowerCase()) {
			case 'floor': default: return q - s
			case 'ceil': return q + (s ^ 1n)
			case 'round': return ((s ? -d : d) / 2n + n) / d
			case 'euclid': return (n / abs(d) - s) * sign(d)
			case 'trunc': return q
			case 'expand': return q + (s ? -1 : 1)
		}
	}

	//Standard Mathematical Modulo (floor). NOT remainder
	//if args are floats, it can have precision errors, similarly to the naive divison-based definition
	const mod = (n, d) => (n % d + d) % d

	//en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition
	Math.mod = function (n, d, F) {
		n = +n; d = +d
		//fallback to 'floor' if 'F' is "euclid" or just invalid
		switch (F = String(F).trim().toLowerCase()) {
			case 'floor': case 'trunc': case 'ceil': case 'round': case 'expand': break
			case 'euclid': d = abs(d); default: F = 'floor'
		}
		return n - d * Math[F](n / d)
	}
	IntN.mod = function (n, d, F) {
		n = toIntN(n); d = toIntN(d)
		switch (F = String(F).trim().toLowerCase()) {
			case 'floor': case 'trunc': case 'ceil': case 'round': case 'expand': break
			case 'euclid': d = abs(d); default: F = 'floor'
		}
		return n - d * IntN.div(n, d, F)
	}

	Math.modPow = function (b, e, m) {
		if (isNan(b = +b) || isNan(e = +e) || isNan(m = +m)) return NaN
		if (e < 2 || e % 1) return mod(b ** e, m)
		b = mod(b, m)
		if (!b) return b
		let out = 1
		do {
			if (e % 2) out = mod(out * b, m)
			e = trunc(e / 2)
			b = mod(b * b, m)
		} while (e > 1)
		return mod(out * b, m)
	}
	IntN.modPow = function (b, e, m) {
		b = toIntN(b); e = toIntN(e); m = toIntN(m)
		if (e < 2n) return mod(e < 0n ? 1n / b ** -e : b ** e, m)
		b = mod(b, m)
		if (!b) return b
		let out = 1n
		do {
			if (e & 1n) out = mod(out * b, m)
			e >>= 1n
			b = mod(b * b, m)
		} while (e > 1n)
		return mod(out * b, m)
	}

	Math.gcd = function (x, y) { return gcd(+x, +y) }
	BigInt.gcd = function (a, b) { return gcd(toIntN(a), toIntN(b)) }

	Math.lcm = function (x, y) { return lcm(+x, +y) }
	BigInt.lcm = function (a, b) { return lcm(toIntN(a), toIntN(b)) }


	Math.factorial = function (/**@type {number}*/ x) {
		if ((x = +x) >= 171) return Infinity
		if (x < 0 || x != x) return NaN
		/*
		We could precompute an int lookup table, and use spline interpolation for faster processing.
		The problem is that if `x` is at the extreme, the output would be `NaN` unless we use extrapolation
		*/
		if (!isInt(x)) return [Gosper, Gamma, Lanczos][2](x)
		let out = 1
		while (x > 0) out *= x--
		return out
	}
	//https://en.wikipedia.org/wiki/Factorial#Properties
	IntN.factorial = function (/**@type {bigint}*/n) {
		n = toIntN(n)
		if (n < 0n) throw new RangeErr('return value is NaN')
		let out = 1n
		while (n > 0n) out *= n--
		return out
	}

	//logarithmic binary search is faster than linear, but the engine will do it for us
	Math.ctz32 = function (x) { return ctz(+x >>> 0) }
	IntN.ctz = function (n) { if (n = toIntN(n)) return ctz(n); throw new RangeErr('return value is Infinity') }

	Math.popcnt32 = function (x) { return popCount(+x >>> 0) }
	IntN.popcnt = function (n) {
		if ((n = toIntN(n)) >= 0n) return popCount(n)
		throw new RangeErr('return value is Infinity')
	}

	//reverse the order of bits using "binary chop"
	Math.rev32 = function (x) {
		x = +x | 0
		x = ((x & 0xffff0000) >>> 0x10) | ((x & 0x0000ffff) << 0x10)
		x = ((x & 0xff00ff00) >>> 8) | ((x & 0x00ff00ff) << 8)
		x = ((x & 0xf0f0f0f0) >>> 4) | ((x & 0x0f0f0f0f) << 4)
		x = ((x & 0xcccccccc) >>> 2) | ((x & 0x33333333) << 2)
		x = ((x & 0xaaaaaaaa) >>> 1) | ((x & 0x55555555) << 1)
		return x >>> 0 //toUint32
	}

	/**
	circular left shift
	@param {number} n
	@param {number} b
	*/
	Math.rotl32 = function (n, b) {
		n = +n
		b = +b & 31
		return (n << b) | (n >>> (32 - b)) >>> 0
	}
	/**
	circular right shift
	@param {number} n
	@param {number} b
	*/
	Math.rotr32 = function (n, b) {
		n = +n
		b = +b & 31
		return ((n >>> b) | (n << (32 - b))) >>> 0
	}

	/**
	https://en.wikipedia.org/wiki/Sinc_function
	@param {number} x
	*/
	Math.sinc = function (x) {
		x = +x
		return x == 0 ? 1 : sine(x) / x
	}

	/**
	interval [0, n), or (n, 0] if negative. By default, it returns an uInt64
	*/
	IntN.random = function (n = 1n << 0x40n) {
		n = toIntN(n)

		const s = n < 0n
		if (s) n = -n //abs

		if (n < 2n) {
			if (n) return 0n
			throw new RangeErr('requested an int equal and NOT equal to zero')
		}
		const n_len = sizeOf(n, 1n, 1n), b = 52n
		let x, x_len, max
		do {
			//in this context, the size of 0 is defined as zero instead of 1
			x = x_len = 0n
			do {
				//build the bigint in `b` blocks, to discard less rand data
				x <<= b; x_len += b
				//`crypto.getRandomValues` is probably unnecesary
				x |= IntN(RNG() * 2 ** 52)
			} while (x_len <= n_len)
			//this condition and the `-1` allow `%` to never be no-op
			const len_d = x_len - n_len - 1n
			x >>= len_d; x_len -= len_d
			max = nthMersenne(x_len)
			//https://stackoverflow.com/a/10984975
		} while (x >= max - max % n)
		x %= n
		return s ? -x : x
	}

	IntN.hypot = function (...values) {
		if (values.length == 1)
			return abs(toIntN(values[0]))
		let sum = 0n
		while (values.length--)
			sum += toIntN(values[values.length - 1]) ** 2n
		return sqrt(sum)
	}

	defProp(Number.prototype, 'toScientific', /** Scientific Notation in base B */ function toScientific(b = 10) {
		let x = this?.valueOf()
		//JIC someone uses the `call` method
		if (!isFloat(x))
			throw new TypeErr('Number.prototype.toScientific requires that `this` be a Number')
		x = Float(x)
		b = Float(b)
		let e
		if (!isInfNaN(x)) { e = x && trunc(logB(abs(x), b)); x /= b ** e }
		else { e = x; x = sign(x) }
		return x.toString(b) + ` * 10^${e.toString(b)} (base 0d${b})`
	}, 0b101)

}

//correction of data descriptors, to make everything equal to vanilla JS
for (const O of [Number, Math, BigInt])
	//`for in` is slower and has more potential side-effects
	for (const k of Object.keys(O)) {
		const isF = typeof O[k] == 'function'
		defProp(O, k, O[k], +isF && 0b101)
		if (isF) defProp(O[k], 'name', O[k].name || k, 1) //name all anonymous funcs
	}
