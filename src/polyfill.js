'use strict' // this will take effect when all imports are removed
/**
# Related
- [Math Extensions proposal](https://github.com/rwaldron/proposal-math-extensions)
- [BigInt Math TC39 proposal](https://github.com/tc39/proposal-bigint-math)
*/
import { isInt, isInfNAN, isNegZero } from './mod/value check'
import { toBigInt as toIntN } from './mod/sanitize'
import { MANTISSA_SIZE } from './mod/const'
import { PHI, MAX64 } from './mod/const'
import { abs, sign, clamp, logB } from './mod/std'
import { trunc, expand } from './lib/rounding'
import { ctz, popCount, sizeOf } from './mod/bitwise'
import { M as nthMersenne } from './lib/Mersenne'
import { root, sqrt } from './lib/root'
import { gcd, lcm } from './mod/factors'

{
	/**
	check if `x` is either `Number` (object-wrapped) or `number` (primitive)
	@template T
	@param {T} x

	@example
	isNumber(0) //true
	isNumber(NaN) //true
	isNumber(Infinity) //true
	isNumber(new Number) //true
	isNumber(Object(0)) //true
	isNumber('0') //false
	*/
	const isFloat = x => /**@type {T extends number | {valueOf(): number} ? true : false}*/(
		typeof x?.valueOf?.() == 'number'
	)

	/**
	 * Short edition of `defineProperty`.
	 * @param {object} o
	 * @param {PropertyKey} p
	 * @param {unknown} v value to set
	 * @param {([boolean, boolean, boolean] | numeric | string)} a descriptor with format [W, E, C]
	 */
	const defProp = (o, p, v, a) => {
		switch (typeof a) {
			case 'number': a &= 7; a = [(a & 4) != 0, (a & 2) != 0, (a & 1) != 0]; break
			case 'bigint': a &= 7n; a = [(a & 4n) != 0n, (a & 2n) != 0n, (a & 1n) != 0n]; break
			case 'string': a = [/w/i.test(a), /e/i.test(a), /c/i.test(a)]; break
			// Linux chmod lol (rwx)
		}
		return Object.defineProperty(o, p, {
			value: v,
			writable: !!a[0], enumerable: !!a[1], configurable: !!a[2]
		})
	}

	const
		IntN = BigInt, Float = Number,
		TypeErr = TypeError, RangeErr = RangeError,
		{ PI, E, log2: lb, exp, sin: sine, random: RNG } = Math,
		{ MAX_SAFE_INTEGER, isNaN } = Float

	/** Ratio of the circumference of a circle to its radius. */
	const TAU = 2 * PI

	/**
	https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/lang/Double.html#MIN_NORMAL
	*/
	const MIN_NORMAL = 2 ** -1022
	//@ts-ignore
	Float.MIN_NORMAL = MIN_NORMAL

	/** max bits per {@link RNG} call */
	const MAX_ENTROPY = MANTISSA_SIZE

	//@ts-ignore
	Math.TAU = TAU
	//@ts-ignore
	Math.SQRT5 = Math.sqrt(5)
	//@ts-ignore
	Math.PHI = PHI

	//@ts-ignore
	IntN.MAX_UINT64 = MAX64
	//@ts-ignore
	IntN.MAX_INT64 = MAX64 >> 1n
	//@ts-ignore
	IntN.MIN_INT64 = -1n << 63n

	Float.isSafeNumber = function (number) {
		return typeof number == 'number' &&
			abs(number) >= MIN_NORMAL &&
			abs(number) <= MAX_SAFE_INTEGER
	}

	Math.logB = function (x, y = E) { return /**@type {number}*/(logB(+x, +y)) }

	//@ts-ignore
	Math.LOG2PHI = lb(PHI)
	//@ts-ignore
	Math.LN_PHI = Math.log(PHI)
	//@ts-ignore
	Math.LOG10PHI = Math.log10(PHI)

	Math.logPHI = function (x) { return logB(+x, PHI) }

	//@ts-ignore
	Math.LOG_PHI2 = Math.logPHI(2)
	//@ts-ignore
	Math.LOG_PHI_E = Math.logPHI(E)
	//@ts-ignore
	Math.LOG_PHI10 = Math.logPHI(10)

	//@ts-ignore
	Math.SQRT3 = sqrt(3)
	Math.LN3 = Math.log(3)
	Math.LOG2_3 = lb(3)
	Math.LOG10_3 = Math.log10(3)
	Math.LOG_PHI3 = Math.logPHI(3)

	Math.log3 = function (x) { return logB(+x, 3) }

	Math.LOG3_2 = Math.log3(2)
	Math.LOG3E = Math.log3(E)

	Math.LOG3_10 = Math.log3(10)
	Math.LOG3PHI = Math.log3(PHI)

	IntN.log2 = function (n) {
		n = toIntN(n)
		if (n > 0n) return sizeOf(n, 1n, 0n)
		throw new RangeErr('Non-positive logarithmation')
	}

	IntN.logB = function (n, b) {
		n = toIntN(n); b = toIntN(b)
		if (n < 1n || b < 2n)
			throw new RangeErr('return value is -Infinity or NaN')
		return /**@type {bigint}*/(logB(n, b))
	}

	/**
	https://github.com/tc39/proposal-Math.signbit/issues/7
	@param {unknown} number
	*/
	Number.signbit = function (number) {
		const n = number
		return typeof n == 'number' &&
			isNaN(n) &&
			n < 0 || isNegZero(n)
	}

	/**
	Round away from `0` (to +-`Infinity`)
	@param {number} x
	*/
	Math.expand = function (x) { return expand(+x) }

	/**
	"KahanBabushkaKleinSum". Summation with minimal rounding errors
	@param {...number} values
	*/
	Math.sum = function (...values) {
		let sum = 0, cs = 0, ccs = 0, c = 0, cc = 0
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

	IntN.sum = function (/** @type {...bigint} */ ...values) {
		let sum = 0n
		// avoid out-of-memory error
		for (; values.length; values.length--)
			sum += toIntN(values[values.length - 1])
		return sum
	}

	/**
	 *
	 * @param {number} x
	 * @param {number} min
	 * @param {number} max
	 * @return {number}
	 */
	Math.clamp = function (x, min, max) { return clamp(+x, +min, +max) }

	/**
	 *
	 * @param {bigint} x
	 * @param {bigint} min
	 * @param {bigint} max
	 * @return {bigint}
	 */
	IntN.clamp = function (x, min, max) { return clamp(toIntN(x), toIntN(min), toIntN(max)) }

	/**
	 * https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/math-scale.js
	 * https://rwaldron.github.io/proposal-math-extensions/#sec-math.scale
	 * @param {number} x
	 * @param {number} inLow
	 * @param {number} inHigh
	 * @param {number} outLow
	 * @param {number} outHigh
	 */
	Math.scale = function (x, inLow, inHigh, outLow, outHigh) {
		x = +x
		if (isInfNAN(x)) return x
		inLow = +inLow; inHigh = +inHigh
		outLow = +outLow; outHigh = +outHigh
		return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow
	}

	/**
	All the integer division defnitions
	@param {bigint} n numerator | dividend
	@param {bigint} d denominator | divisor
	@param {'floor' | 'trunc' | 'ceil' | 'round' | 'expand' | 'euclid'} F function or variant
	@return {bigint} quotient
	*/
	IntN.div = function (n, d, F) {
		n = toIntN(n); d = toIntN(d)
		const q = n / d
		// this could be wrong when using "euclid"
		if (!(n % d)) return q
		const s = (n < 0n) != (d < 0n) ? 1n : 0n // XOR of sign bits
		switch (String(F).trim().toLowerCase()) {
			case 'floor': default: return q - s
			case 'ceil': return q + (s ^ 1n)
			case 'round': return ((s ? -d : d) / 2n + n) / d
			case 'euclid': return (n / abs(d) - s) * sign(d)
			case 'trunc': return q
			case 'expand': return q + (s ? -1 : 1)
		}
	}

	/**
	Standard Mathematical Modulo (floor). NOT remainder.
	If args are floats, it can have precision errors, similarly to the naive divison-based definition

	@template {numeric} T
	@param {T} n
	@param {T} d
	*/
	//@ts-ignore
	const mod = (n, d) => /**@type {T}*/((n % d + d) % d)

	// https://en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition
	/**
	 *
	 * @param {number} n
	 * @param {number} d
	 * @param {'floor' | 'trunc' | 'ceil' | 'round' | 'expand' | 'euclid'} F
	 */
	Math.mod = function (n, d, F) {
		n = +n; d = +d
		// fallback to "floor" if `F` is "euclid" or just invalid
		switch (F = String(F).trim().toLowerCase()) {
			case 'floor': case 'trunc': case 'ceil': case 'round': case 'expand':
				break
			case 'euclid':
				d = abs(d)
			// eslint-disable-next-line no-fallthrough
			default:
				F = 'floor'
		}
		return n - d * Math[F](n / d)
	}
	/**
	 *
	 * @param {bigint} n
	 * @param {bigint} d
	 * @param {'floor' | 'trunc' | 'ceil' | 'round' | 'expand' | 'euclid'} F
	 */
	IntN.mod = function (n, d, F) {
		n = toIntN(n); d = toIntN(d)
		switch (F = String(F).trim().toLowerCase()) {
			case 'floor': case 'trunc': case 'ceil': case 'round': case 'expand':
				break
			case 'euclid':
				d = abs(d)
			// eslint-disable-next-line no-fallthrough
			default:
				F = 'floor'
		}
		return n - d * IntN.div(n, d, F)
	}

	Math.modPow = function (/** @type {number} */ b, /** @type {number} */ e, /** @type {number} */ m) {
		if (isNaN(b = +b) || isNaN(e = +e) || isNaN(m = +m)) return NaN
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
	/**
	 *
	 * @param {bigint} b
	 * @param {bigint} e
	 * @param {bigint} m
	 */
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

	Math.gcd = function (/** @type {number} */ x, /** @type {number} */ y) { return gcd(+x, +y) }
	IntN.gcd = function (/** @type {bigint} */ a, /** @type {bigint} */ b) { return gcd(toIntN(a), toIntN(b)) }

	Math.lcm = function (/** @type {number} */ x, /** @type {number} */ y) { return lcm(+x, +y) }
	IntN.lcm = function (/** @type {bigint} */ a, /** @type {bigint} */ b) { return lcm(toIntN(a), toIntN(b)) }

	Math.root = function (/** @type {number} */ x, y = 2) { return root(+x, +y) }
	IntN.root = function (/** @type {bigint} */ n, i = 2n) { return root(toIntN(n), toIntN(i)) }
	IntN.sqrt = function (/** @type {bigint} */ n) { return sqrt(toIntN(n)) }
	IntN.cbrt = function (/** @type {bigint} */ n) { return root(toIntN(n), 3n) }


	// factorial approximations for non-ints.
	// These 3 are trash, none make use of full precision. I need help to make these more accurate
	/**
	improvement of Stirling approximation
	@param {number} x
	*/
	const Gosper = x => Math.sqrt((x + 1 / 6) * TAU) * (x / E) ** x

	/**
	Gamma Function (+1) defined as Summation instead of Integration
	@param {number} x
	*/
	const Gamma = x => {
		let t = 1, s0, s1 = 0 ** x
		do {
			s0 = s1
			s1 += t ** x * exp(-t)
			t++
		}
		while (s0 != s1)
		return s0
	}

	/**
	https://en.wikipedia.org/wiki/Lanczos_approximation#Simple_implementation
	@param {number} z
	@return {number}
	*/
	const Lanczos = z => {
		const p = [
			676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
			12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
		]

		if (z < 0.5) return PI / (sine(PI * z) * Lanczos(1 - z))

		z--
		let x = 0.99999999999980993

		for (let i = 0; i < p.length; i++)
			x += p[i] / (z + i + 1)

		const t = z - 0.5 + p.length
		return sqrt(TAU) * t ** (z + 0.5) * exp(-t) * x
	}

	/**
	 * Gamma + 1
	 * @param {number} x
	 */
	Math.factorial = function (x) {
		x = +x
		if (x >= 171) return Infinity
		if (x < 0 || isNaN(x)) return NaN
		/*
		We could precompute an int lookup table, and use spline interpolation for faster processing.
		The problem is that if `x` is at the extreme, the output would be `NaN` unless we use extrapolation
		*/
		if (!isInt(x)) return [Gosper, Gamma, Lanczos][2](x)
		let out = 1
		while (x > 0) out *= x--
		return out
	}

	// to-do: https://en.wikipedia.org/wiki/Factorial#Properties (optimization)
	IntN.factorial = function (/**@type {bigint}*/n) {
		n = toIntN(n)
		if (n < 0n) throw new RangeErr('return value is NaN')
		let out = 1n
		while (n > 0n) out *= n--
		return out
	}

	Math.ctz32 = function (/** @type {number} */ x) { return ctz(+x >>> 0) }
	IntN.ctz = function (/** @type {bigint} */ n) {
		n = toIntN(n)
		if (n) return ctz(n)
		throw new RangeErr('return value is Infinity')
	}

	Math.popcnt32 = function (/** @type {number} */ x) { return popCount(+x >>> 0) }
	IntN.popcnt = function (/** @type {bigint} */ n) {
		if ((n = toIntN(n)) >= 0n) return popCount(n)
		throw new RangeErr('return value is Infinity')
	}

	/**
	 * Reverse the bit order.
	 * @param {number} x
	 */
	Math.rev32 = function (x) {
		x = +x | 0
		// "binary chop"
		x = ((x & 0xffff0000) >>> 0x10) | ((x & 0x0000ffff) << 0x10)
		x = ((x & 0xff00ff00) >>> 8) | ((x & 0x00ff00ff) << 8)
		x = ((x & 0xf0f0f0f0) >>> 4) | ((x & 0x0f0f0f0f) << 4)
		x = ((x & 0xcccccccc) >>> 2) | ((x & 0x33333333) << 2)
		x = ((x & 0xaaaaaaaa) >>> 1) | ((x & 0x55555555) << 1)
		return x >>> 0 //toUint32
	}

	/**
	 * Circular left shift.
	 * @param {number} n
	 * @param {number} b
	 */
	Math.rotl32 = function (n, b) {
		n = +n
		b = +b & 31
		return (n << b) | (n >>> (32 - b)) >>> 0
	}
	/**
	 * Circular right shift.
	 * @param {number} n
	 * @param {number} b
	 */
	Math.rotr32 = function (n, b) {
		n = +n
		b = +b & 31
		return ((n >>> b) | (n << (32 - b))) >>> 0
	}

	/**
	 * https://en.wikipedia.org/wiki/Sinc_function
	 * @param {number} x
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

		const sgn = n < 0n
		if (sgn) n = -n //abs

		if (n < 2n) {
			if (n) return 0n
			throw new RangeErr('requested an int equal and NOT equal to zero')
		}
		const n_len = sizeOf(n, 1n, 1n), bits_per_block = IntN(MAX_ENTROPY)
		let out, out_len, max
		do {
			// in this context, the size of 0 is defined as zero instead of 1
			out = out_len = 0n
			do {
				// build the bigint in `bits_per_block`b blocks, to discard less rand data
				out <<= bits_per_block
				out_len += bits_per_block

				// `crypto.getRandomValues` is unnecesary
				out |= IntN(RNG() * 2 ** MAX_ENTROPY)
			} while (out_len <= n_len)
			// this condition and the `-1` allow `%` to never be no-op
			const len_d = out_len - n_len - 1n
			out >>= len_d; out_len -= len_d
			max = nthMersenne(out_len)
			// https://stackoverflow.com/a/10984975
		} while (out >= max - max % n)
		out %= n
		return sgn ? -out : out
	}

	/**
	 * Returns the square root of the sum of squares of its arguments.
	 * @param {...bigint} values Values to compute the square root for.
	 * If no arguments are passed, the result is `0n`.
	 * If there is only one argument, the result is the absolute value.
	 * If all arguments are `0n`, the result is `0n`.
	 * @returns {bigint}
	 */
	IntN.hypot = function (...values) {
		if (values.length == 1)
			return abs(toIntN(values[0]))
		let sum = 0n
		// avoid OOM
		for (; values.length; values.length--)
			sum += toIntN(values[values.length - 1]) ** 2n
		return sqrt(sum)
	}


	/**
	converts degrees to radians by default
	@param {number} x
	@param {number} [y=360] the input scale.
	360: degrees
	1: Tau radians
	*/
	Math.toRadians = function (x, y = 360) { return TAU / +y * +x }

	/**
	converts radians to degrees by default
	@param {number} x
	@param {number} [y=360] the output scale.
	360: degrees
	1: Tau radians
	*/
	Math.fromRadians = function (x, y = 360) { return +x / (TAU / +y) }

	/**
	bouncing sine waveform (periodic parabola)
	@param {number} x
	*/
	Math.sinAbs = function (x) { return abs(sine((+x + PI / 3) / 2)) * 2 - 1 }

	/**
	Scientific Notation in base B
	@param radix base
	*/
	const toSci = function toScientific(radix = 10) {
		let x = this?.valueOf?.()
		if (!isFloat(x))
			throw new TypeErr('Number.prototype.toScientific requires that `this` be a Number')

		// coerce to primitive if Object-wrapped
		x = +x
		// throw if `BigInt` or `Symbol`, just like `toString` does
		radix = +radix

		let exp
		if (!isInfNAN(x)) {
			exp = x && trunc(logB(abs(x), radix))
			x /= radix ** exp
		}
		else {
			exp = x
			x = sign(x)
		}
		return x.toString(radix) + ` * 10^${exp.toString(radix)} (base 0d${radix})`
	}
	defProp(Number.prototype, toSci.name, toSci, 0b101)

	// correction of data descriptors, to make everything equal to vanilla/canon JS
	for (const O of [Number, Math, BigInt])
		// `for in` is slower and has more potential side-effects
		for (const k of Object.keys(O)) {
			const isF = typeof O[k] == 'function'
			defProp(O, k, O[k], +isF && 0b101)
			if (isF) defProp(O[k], 'name', O[k].name || k, 1) // name all anonymous funcs
		}


	const AssertionError = class extends Error { constructor(message) { super(message) } }

	/**
	ensure that a predicate that's supposed to always be `true` is, in fact, `true`
	@param {boolean} condition condition to check
	@param {string} [msg] error `message`, in case it goes wrong
	*/
	const assert = (condition, msg) => { if (!condition) throw new AssertionError(msg) }

	const TEST_MODE = false

	if (TEST_MODE) {
		const IntN = BigInt

		const b = IntN.asIntN(0x40, IntN.random()),
			e = IntN.random(0xffn),
			m = IntN.asIntN(0x40, IntN.random()),
			F = ['euclid', 'floor', 'trunc', 'ceil', 'round', 'roundInf'][Math.random() * 6 | 0]

		assert(IntN.modPow(b, e, m, F) == IntN.mod(b ** e, m, F), 'wrong modular exponentiation')
	}
}