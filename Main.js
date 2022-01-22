//IIFE with closure, for encapsulation and localization
(function(random01, sin, exp)
{
	'use strict';
	const isPrimitive = x => x === null || !(typeof x == 'object' || typeof x == 'function');

	/**
	*Short edition of `defineProperty`
	*@param {object} O Object to modify
	*@param {string} p key (property name) to define
	*@param {*} v value to set
	*@param {(boolean[]|numeric|string)} a bool descriptor with format [W, E, C]
	*/
	const defProp = function(O, p, v, a)
	{
		switch (typeof a)
		{
			case 'number':
				a &= 7;
				a = [a & 4, a & 2, a & 1];
				break;
			case 'bigint':
				a &= 7n;
				a = [a & 4n, a & 2n, a & 1n];
				break;
			case 'string':
				//Linux chmod lol (rwx)
				a = [/w/i.test(a), /e/i.test(a), /c/i.test(a)];
				break;
		}
		return Object.defineProperty(O, p, {value: v, writable: !!a[0], enumerable: !!a[1], configurable: !!a[2]})
	};

	//for non-Deno environments
	const AssertionError = class extends Error {constructor(m) {super(m)}},
		assert = function(c, m) {if (!c) throw new AssertionError(m)};

	//github.com/tc39/proposal-relative-indexing-method#polyfill
	function at(n)
	{
		//throw the same error as built-in implementation
		if (this === null || this === undefined) throw new TypeError('Cannot convert undefined or null to object');
		let l = this.length;
		//BigInt (and object-wrapped bigint) support
		if (isBigInt(n)) l = BigInt(l)
		else n = trunc(+n) || 0; //toIntegerOrInfinity
		if (n < 0) n += l;
		return n < 0 || n >= l ? undefined : this[n]
	}
	for (const C of [Array, String, Reflect.getPrototypeOf(Int8Array)])
		defProp(C.prototype, 'at', at, 0b101);


	/**
	*The main global numerical object.
	*the name is inspired by Ecmascript's `toNumeric` abstract function.
	*this is intended to work with ANY numerical value,
	*so if BigFloat/BigDecimal manage to get to Stage 3 of tc39, I'll add support for them
	*@var {object} Numeric
	*/
	defProp(globalThis, 'Numeric', {}, 0b101)

	/**
	*any strictly numerical value
	*@typedef {(number|bigint)} numeric
	*/

	const isNumber = x => typeof x?.valueOf() == 'number';
	/**
	*check if primitive number or object-wrapped number,
	*to ensure it can be operated as a number.
	*@param {*} value
	*@return {boolean}
	*/
	Number.isNumber = function(value) {return isNumber(value)};

	const isBigInt = x => typeof x?.valueOf() == 'bigint';
	/**
	*check prim BigInt or obj-wrap bigint (ensure operability as bigint).
	*@param {*} value
	*@return {boolean}
	*/
	BigInt.isBigInt = function(value) {return isBigInt(value)};

	const isNumeric = x => isNumber(x) || isBigInt(x);
	/**
	*check if any numeric value
	*@param {*} value
	*@return {boolean}
	*/
	Numeric.isNumeric = function(value) {return isNumeric(value)};

	const isNegZero = x => x === 0 && 1 / x < 0;
	/**
	*check signed/negative zero
	*@param {number} number
	*@return {boolean}
	*/
	Number.isMinusZero = function(number) {return isNegZero(number)};

	/**
	*https://tc39.es/ecma262/multipage/abstract-operations.html#sec-tobigint
	*@param {(boolean|string|bigint)} x
	*@return {bigint}
	*/
	const toBigInt = x =>
	{
		const B = typeof x?.valueOf();
		if (B == 'string' || B == 'boolean' || B == 'bigint') return BigInt(x)
		throw new TypeError(`Cannot convert ${x} to BigInt`)
	};

	//localization increases performance, and protects against external side-effects
	const abs = x => x < 0 || isNegZero(x) ? -x : x,
		sign = x => {const ONE = (x ^ x) ** (x ^ x); return x && (x < 0 ? -ONE : ONE)},
		signSplit = x => [sign(x), abs(x)], //should be reversed order
		isInf = x => x === Infinity || x === -Infinity,
		isNan = x => x != x, //NOT A TYPO. capitalization is to avoid ambiguity
		isInfNan = x => isInf(x) || isNan(x), //!isFinite(x)
		isInt = x => (isNumber(x) && x % 1 == 0) || isBigInt(x),
		trunc = x => isInt(x) ? x : x - x % 1,
		floor = x => isInt(x) ? x : trunc(x) - (x < 0 ? 1 : 0),
		ceil = x => isInt(x) ? x : trunc(x) + (x > 0 ? 1 : 0),
		round = x => isInt(x) || isInfNan(x) ? x : x < 0 && x >= -0.5 ? -0 : abs(x) % 1 < 0.5 ? floor(x) : ceil(x),
		roundInf = x => (x < 0 ? floor : ceil)(x); //opposite of `trunc`

	//TO-DO fix bug when strings are large
	globalThis.isFinite = function(value) {return isBigInt(value) || !isInfNan(+value)}
	//both `parseInt` AND `parseFloat` never throw on bigints, so I decided to "fix" these other functions
	globalThis.isNaN = function(value) {return !isBigInt(value) || isNan(+value)}

	/**
	*get the internal bits (binary64 IEEE 754 representation)
	*@param {number} number
	*@return {bigint}
	*/
	Number.castBigInt = function(number) {return new BigUint64Array(new Float64Array([number]).buffer)[0]};

	//do these 2 methods need hex support?

	/**
	*mask the 64 LSBs and read as IEEE-754 binary64 floating-point format
	*@param {bigint} n
	*@return {number}
	*/
	BigInt.castNumber = function(n) {return new Float64Array(new BigUint64Array([n]).buffer)[0]};

	//parseInt for bigints
	BigInt.parse = function(string, radix)
	{
		string = String(string).trimStart().toLowerCase();
		let sign = 1n;
		if (string) //the only falsy primitive string is empty, no need to check length
		{
			switch (string[0])
			{
				case '\x2D': sign = -1n
				case '\x2B': string = string.substring(1)
			}
		}
		radix = Number(radix) | 0; //TO-DO: fix precision loss when bigint or string
		let stripPrefix = true;
		if (radix) //it will never be NaN, no need to check for zero
		{
			if (radix < 2 || radix > 36) throw new RangeError('Invalid base')
			if (radix != 0x10) stripPrefix = false //why only 16? it should include 2 and 8
		}
		else
			radix = 10;
		if (stripPrefix && string.length >= 2 && string[0] == '0' && string[1] == 'x')
		{//why only 'x'? it should include 'b' and 'o'
			string = string.substring(2);
			radix = 0x10
		}
		const charset = new Map;
		for (let i = 0n; i < radix; i++) charset.set('0123456789abcdefghijklmnopqrstuvwxyz'[i], i);
		let end = -1;
		while (++end < string.length)
			if (!charset.has(string[end])) break;
		string = string.substring(0, end);
		let int = 0n;
		if (!string) return int; //no need to throw, 0 fits better
		radix = BigInt(radix); end = BigInt(end);
		//DO NOT REVERSE iteration order
		for (let i = end - 1n; i >= 0; i--) int += charset.get(string[end - i - 1n]) * radix ** i;
		return sign * int
	};

	//TO-DO: fix error when strings have 1 "." (dot)
	BigInt.from = function(value)
	{
		if (isBigInt(value)) return BigInt(value);
		if (isNumber(value))
		{
			value = trunc(+value);
			return !value ? 0n
				: (isInf(value)
					? (value < 0 ? -1n : 1n)
					: BigInt(value))
		}
		if (!value) return 0n;
		value = value.valueOf();
		if (!value) return 0n;
		if (typeof value == 'object') return 1n;
		return BigInt(value);
	};

	//`valueOf` may not be reliable or trustworthy
	//maybe I should check its return value separately, to avoid bias
	const isSymbol = x => typeof x?.valueOf() == 'symbol';

	const toNumeric = x =>
	{
		if (isNumber(x)) return +x;
		if (isBigInt(x)) return BigInt(x);
		if (x === undefined || isSymbol(x)) return NaN;
		if (x === null) return 0;
		x = x.valueOf();
		if (!isPrimitive(x)) x = String(x);
		if (!+x || abs(+x) < 2 ** 53 ||
			//I know /\s/ exists, but `trim` is faster and more readable
			/^[-+]?Infinity$/.test(String(x).trim())) return +x;
		if (typeof x == 'string' && x.includes('.')) return BigInt(x.substring(0, x.indexOf('.')));
		return BigInt(x)
	};
	/**
	*coerce to numeric
	*by using the least invasive/intrusive algorithm I know
	*@param {*} value
	*@return {numeric}
	*/
	Numeric.from = function(value) {return toNumeric(value)};

	/**
	*check if prim value is any integer
	*@param {numeric} x
	*@return {boolean}
	*/
	Numeric.isInteger = function(x) {return isInt(x)};

	/**
	*@param {numeric} x
	*@return {boolean}
	*/
	Numeric.isFinite = function(x) {return isNumeric(x) && !isInfNan(x)};

	//docs.oracle.com/javase/8/docs/api/java/lang/Double.html#MIN_NORMAL
	Number.MIN_NORMAL = 2 ** -1022;

	Number.isSafeNumber = function(number)
		{return typeof number == 'number' && abs(number) >= Number.MIN_NORMAL && abs(number) <= Number.MAX_SAFE_INTEGER};

	//Scientific Notation in base B
	defProp(Number.prototype, 'toScientific',
		function SciNotB(b = 10)
		{
			let x = this?.valueOf();
			//JIC someone uses the `call` method
			if (typeof x != 'number')
				throw new TypeError("Number.prototype.toScientific requires that 'this' be a Number");
			x = Number(x); b = Number(b);
			let e;
			if (!isInfNan(x)) {e = x && trunc(logB(abs(x), b)); x = x / b ** e}
			else {e = x; x = sign(x)}
			return x.toString(b) + ' * ' + '10' + '^' + e.toString(b) + ` (base 0d${b})`
		},
		0b101
	)

	//Summation with minimal rounding errors
	//"KahanBabushkaKleinSum"
	Math.sum = function(...values)
	{
		values = values.map(x => +x);
		let sum = 0, cs = 0, ccs = 0, c = 0, cc = 0;
		for (const v of values)
		{
			let t = sum + v;
			c = abs(sum) >= abs(v)
				? (sum - t) + v
				: (v - t) + sum;
			sum = t;
			t = cs + c;
			cc = abs(cs) >= abs(c)
				? (cs - t) + c
				: (c - t) + cs;
			cs = t;
			ccs = ccs + cc
		}
		return sum + cs + ccs
	};

	/**
	*@param {bigint} n binary numeral to measure
	*@param {bigint} b unit of measurement. 1: bit, 8: Byte, 16: word, 32: D-word, 64: Q-word
	*@param {numeric} i initial value of counter
	*@return {numeric}
	*/
	const sizeOf = (n, b, i) => {while (n >>= b) i++; return i};

	//ith (degree i) root of n
	const root = (x, i = 2) =>
	{
		const B = isBigInt(x);
		if (B) i = BigInt(i);
		const ZERO = B ? 0n : 0, ONE = B ? 1n : 1;
		if (i == 1) return x;
		if (!B && isInfNan(x ** (1 / i))) return x ** (1 / i);
		x = signSplit(x);
		//I feel like something is wrong here
		if (!i) {if (x[1] > 1) throw new RangeError('return value is NaN'); return ZERO}
		if (x[0] == -1 && !(i & ONE)) throw new RangeError('return value is a Complex number');
		if (i < 0) {if (!x[1]) throw new RangeError('return value is Infinity'); return x[1] == 1 ? x[0] : ZERO}
		if (!x[1]) return 0n;
		const j = i - ONE; let x0, x1;
		if (B)
		{
			//a ^ (1 / k) = b ^ (log_b(a) / k)
			const log = sizeOf(x[1], 1n, 0n);
			x0 = x[1] >> (log - log / i);
		}
		else x0 = x[1] ** (1 / i);
		x1 = x0 * j / i + x[1] / (i * x0 ** j)
		//Newton's Method
		while (x1 < x0)
		{
			x0 = x1;
			x1 = x1 * j / i + x[1] / (i * x1 ** j)
		}
		return x0 * x[0]
	};

	const sqrt = x =>
	{
		if (!isBigInt(x)) return x ** 0.5; //is this accurate?
		if (x < 2n) {if (x < 0n) throw new RangeError('return value is Complex number'); return x}
		let x0 = x >> (sizeOf(x, 1n, 0n) >> 1n),
			x1 = (x0 + x / x0) >> 1n;
		//Heron's Method
		while (x1 < x0)
		{
			x0 = x1;
			x1 = (x1 + x / x1) >> 1n
		}
		return x0
	};

	const cbrt = x => root(x, 3);

	Math.TAU = Math.PI * 2; //no precision loss, because multiplier is power of two

	Math.SQRT5 = sqrt(5);

	//Golden Ratio
	Math.PHI = Math.SQRT5 / 2 + 0.5;

	//in general, lb has better precision and performance than ln
	const logB = (function(log) {return function(x, b = Math.E) {return log(x) / log(b)}})(Math.log2);
	/**
	*@param {number} x get exponent of this
	*@param {number} [y=Euler] base of logarithm
	*@return {number}
	*/
	Math.logB = function(x, y = Math.E) {return logB(+x, +y)};

	Math.LOG2PHI = Math.log2(Math.PHI);
	Math.LNPHI = Math.log(Math.PHI);
	Math.LOG10PHI = Math.log10(Math.PHI);

	Math.logPHI = function(x) {return logB(+x, Math.PHI)};

	Math.LOGPHI2 = Math.logPHI(2);
	Math.LOGPHIE = Math.logPHI(Math.E);
	Math.LOGPHI10 = Math.logPHI(10);

	Math.SQRT3 = sqrt(3);
	Math.LN3 = Math.log(3);
	Math.LOG2_3 = Math.log2(3);
	Math.LOG10_3 = Math.log10(3);
	Math.LOGPHI3 = Math.logPHI(3);
	//ternary lives also matter
	Math.log3 = function(x) {return logB(+x, 3)};
	//stop discriminating the number 3
	Math.LOG3_2 = Math.log3(2);
	Math.LOG3E = Math.log3(Math.E);
	Math.LOG3_10 = Math.log3(10);
	Math.LOG3PHI = Math.log3(Math.PHI);

	//Maximum unsigned 64bit value
	const MAX64 = ~(-1n << 0x40n);
	BigInt.UINT64MAX = MAX64;

	//Maximum signed 64bit value
	BigInt.INT64MAX = MAX64 >> 1n;

	//Minimum signed 64bit value
	BigInt.INT64MIN = -1n << 63n;


	//github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.signbit.js
	Number.signbit = function(number)
		{return typeof number == 'number' && !isNan(number) && number < 0 || isNegZero(number)};

	//for consistency, no static method will be an arrow function
	BigInt.sign = function(n) {return sign(toBigInt(n))};
	BigInt.abs = function(n) {return abs(toBigInt(n))};

	Numeric.sign = function(x) {return sign(toNumeric(x))};
	Numeric.abs = function(x) {return abs(toNumeric(x))};

	Numeric.signSplit = function(x) {return signSplit(toNumeric(x))}; //should this exist?

	BigInt.max = function(...values)
	{
		values = values.map(toBigInt);
		let i = 0, m = v;
		while (++i < values.length) if (v > m) m = v;
		return m
	};
	BigInt.min = function(...values)
	{
		values = values.map(toBigInt);
		let i = 0, m = v;
		while (++i < values.length) if (v < m) m = v;
		return m
	};

	Numeric.max = function(...values)
	{
		values = values.map(toNumeric);
		let i = 0, m = v;
		while (++i < values.length) if (v > m) m = v;
		return m
	};
	/*
	TO-DO: return Number type only if it's safe, otherwise BigInt type.
	Only do that if there's multiple valid choices.
	*/
	Numeric.min = function(...values)
	{
		values = values.map(toNumeric);
		let i = 0, m = v;
		while (++i < values.length) if (v < m) m = v;
		return m
	};

	const clamp = (x, min, max) =>
	{
		if (min > max) [min, max] = [max, min];
		return x > max ? max : x < min ? min : x
	};

	Math.clamp = function(x, min, max) {return clamp(+x, +min, +max)};

	BigInt.clamp = function(x, min, max) {return clamp(toBigInt(x), BigInt(min), BigInt(max))};

	//if the args are not coerced to the same type, the output isn't guaranteed to be the same type as `x`
	Numeric.clamp = function(x, min, max) {return clamp(toNumeric(x), toNumeric(min), toNumeric(max))};

	//github.com/zloirock/core-js/blob/master/packages/core-js/internals/math-scale.js
	//https://rwaldron.github.io/proposal-math-extensions/#sec-math.scale
	Math.scale = function(x, inLow, inHigh, outLow, outHigh)
	{
		if (isInfNan(x = +x)) return x;
		inLow = +inLow; inHigh = +inHigh;
		//avoid string concatenation if `outLow` is text
		outLow = +outLow; outHigh = +outHigh;
		return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow
	};

	//round towards unsigned (any) Infinity
	Math.roundInf = function(x) {return roundInf(+x)};

	//reverse the order of bits using "binary chop"
	Math.rev32 = function(x)
	{
		let n = +x | 0;
		n = ((n & 0xffff0000) >>> 16) | ((n & 0x0000ffff) << 16);
		n = ((n & 0xff00ff00) >>>  8) | ((n & 0x00ff00ff) <<  8);
		n = ((n & 0xf0f0f0f0) >>>  4) | ((n & 0x0f0f0f0f) <<  4);
		n = ((n & 0xcccccccc) >>>  2) | ((n & 0x33333333) <<  2);
		n = ((n & 0xaaaaaaaa) >>>  1) | ((n & 0x55555555) <<  1);
		//toUint32
		return n >>> 0
	};

	//circular left shift
	Math.rotl32 = function(n, b)
	{
		n = +n;
		b = +b & 31; //coerce and throw the same error as built-ins, then apply mod 32, JIC
		n = (n << b) | (n >>> (32 - b));
		return n >>> 0
	};
	//circular right shift
	Math.rotr32 = function(n, b)
	{
		n = +n; b = +b & 31;
		n = (n >>> b) | (n << (32 - b));
		return n >>> 0
	};

	//is the size of 0 really 1?
	BigInt.sizeOf = function(n, b = 8) {return sizeOf(abs(toBigInt(n)), abs(BigInt(b)), 1n)};

	//lb(bigint)
	BigInt.log2 = function(n)
		{if ((n = toBigInt(n)) > 0n) return sizeOf(n, 1n, 0n); throw new RangeError('Non-positive logarithmation')};

	//3 is the closest integer to `Math.E`
	BigInt.logB = function(n, b = 3n)
	{
		n = toBigInt(n); b = BigInt(b);
		if (n < 1n || b < 2n) throw new RangeError('return value is -Infinity or NaN');
		let i = 0n; while (n /= b) i++;
		return i
	};

	Numeric.logB = function(x, b = 2)
	{
		x = toNumeric(x); b = toNumeric(b);
		if (isNan(x) || isNan(b) || x < 0 || b <= 1) return NaN;
		if (x == 0) return -Infinity;
		if (x == 1) return 0;
		return (isBigInt(x) && isBigInt(b) ? BigInt : Math).logB(x, b)
	};

	Math.root = function(x, y = 2) {return root(+x, +y)};

	BigInt.root = function(n, i = 2n) {return root(toBigInt(n), toBigInt(i))};

	Numeric.root = function(x, n)
	{
		x = toNumeric(x); n = toNumeric(n);
		if (isNan(x) || isNan(n)) return NaN;
		const a = abs(x), ZERO = x ^ x;
		if (!n) return a > 1 ? NaN : ZERO;
		if (x < 0 && (isBigInt(n) && !(n & 1n))) return NaN;
		if (n < 0) return a ? (a == 1 ? sign(x) : ZERO) : Infinity;
		if (!a) return ZERO;
		return (isBigInt(x) && isBigInt(n) ? BigInt : Math).root(x, n)
	};

	BigInt.sqrt = function(n) {return sqrt(toBigInt(n))};

	/**
	*@param {*} x
	*@return {numeric}
	*/
	Numeric.sqrt = function(x) {return (x = toNumeric(x)) < 0 ? NaN : sqrt(x)};

	//get random int32
	Math.random32 = function() {return random01() * 2 ** 32 | 0};

	//get random non-negative safe integer
	Math.randomSafe = function()
	{
		/*
		only 52bits are generated by `Math.random`,
		so "rand() << 53" must be used to allocate space for the missing bit.
		a bool is enough to fill it (the LSB)
		*/
		return random01() * 2 ** 53 + (random01() < 0.5);
	};

	//interval [0, n), or (n, 0] if negative
	//by default, it returns an uInt64
	BigInt.random = function(n = 1n << 0x40n)
	{
		n = toBigInt(n);
		const n_len = BigInt.sizeOf(n, 1n),
			s = n < 0n;
		if (s) n = -n; //abs
		let x, x_len, max;
		do {
			x = 0n; x_len = 1n;
			while (x_len < n_len)
			{
				//build the bigint in 52b blocks
				//for speed, and to avoid discarding too much data
				x <<= 52n;
				x_len += 52n;
				//crypto.getRandomValues is overkill
				x |= BigInt(random01() * 2 ** 52)
			}
			const len_diff = x_len - n_len - 1n;
			//remove bias
			x >>= len_diff; x_len -= len_diff;
			max = ~(-1n << x_len);
		} while (x >= max - max % n) //check if there's bias
		x %= n;
		return s ? -x : x
	};

	//Euclidean division
	Math.divEuclid = function(x, y) {return floor(+x / abs(+y)) * sign(+y)};
	//the other variants of int-div are too short

	BigInt.div = function(n, d, F)
	{//n: numerator|dividend. d: denominator|divisor
		n = toBigInt(n); d = toBigInt(d);
		//this could be wrong when using "euclid"
		if (!(n % d)) return n / d;
		//sign bit
		const s = (n < 0n) != (d < 0n);
		switch (String(F).trim().toLowerCase())
		{
			case 'floor': default: return n / d - BigInt(s);
			case 'ceil': return n / d + BigInt(!s);
			case 'round': return ((s ? -d : d) / 2n + n) / d;
			case 'euclid': return (n / abs(d) - BigInt(s)) * sign(d);
			case 'trunc': return n / d;
		}
	};

	//Standard Mathematical Modulo (floor). NOT remainder
	const mod = (n, d) => (n % d + d) % d;
	//TO-DO: localize a multi-mod function.
	//TO-DO: maybe do not use "multi-mod", make each one independent,
	//floor and euclid are the most used

	//en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition
	Math.mod = function(n, d, F)
	{
		n = +n; d = +d;
		//TO-DO: fix mod(x, Infinity) == NaN
		F = String(F).trim().toLowerCase();
		if (F == 'euclid') d = abs(+d);
		//fallback to 'floor' if 'F' is "euclid" or just invalid
		if (!['floor', 'trunc', 'ceil', 'round'].includes(F))
			F = 'floor';
		return n - d * Math[F](n / d);
	};

	BigInt.mod = function(n, d, F)
	{
		n = toBigInt(n); d = toBigInt(d);
		F = String(F).trim().toLowerCase();
		if (F == 'euclid') d = BigInt.abs(d);
		if (!['floor', 'trunc', 'ceil', 'round'].includes(F))
			F = 'floor';
		return n - d * BigInt.div(n, d, F);
	};

	Numeric.mod = function(n, d, F)
	{
		n = toNumeric(n); d = toNumeric(d);
		return (isBigInt(n) && isBigInt(d) ? BigInt : Math).mod(n, d, F)
	};

	Math.modPow = function(b, e, m, F)
	{
		b = +b; e = +e; m = +m;
		if (b != b || e != e || m != m) return NaN;
		const mod = Math.mod;
		//WARNING: precision won't be preserved if exponent isn't int
		if (e < 2 || e % 1) return mod(b ** e, m, F);
		b = mod(b, m, F);
		if (!b) return b;
		let out = 1;
		while (e)
		{
			if (e % 2) out = mod(out * b, m, F);
			e = trunc(e / 2);
			b = mod(b * b, m, F);
		}
		return out
	};

	BigInt.modPow = function(b, e, m, F)
	{
		const mod = BigInt.mod;
		b = toBigInt(b); e = toBigInt(e); m = toBigInt(m);
		//TO-DO: fix potential OOM error
		if (e < 2n) return mod(e < 0n ? 1n / b ** -e : b ** e, m, F);
		b = mod(b, m, F);
		if (!b) return b;
		let out = 1n;
		while (e)
		{
			if (e & 1n) out = mod(out * b, m, F);
			e >>= 1n;
			b = mod(b * b, m, F);
		}
		return out
	};

	/**
	*converts degrees to radians by default
	*@param {number} x
	*@param {number} [y=360] the input scale
	*@return {number}
	*/
	Math.angleToRad = function(x, y = 360) {return Math.TAU / +y * +x};
	//scale = 360: degrees
	//scale = 1: Tau radians

	/**
	*converts radians to degrees by default
	*@param {number} x
	*@param {number} [y=360] the output scale
	*@return {number}
	*/
	Math.radToAngle = function(x, y = 360) {return +x / (Math.TAU / +y)};

	/**
	*bouncing sine waveform (periodic parabola)
	*@param {number} x
	*@return {number}
	*/
	Math.sinAbs = function(x) {return abs(sin((+x + Math.PI / 3) / 2)) * 2 - 1};

	/**
	*trigonometric sawtooth waveform
	*@param {number} x
	*@return {number}
	*/
	Math.sawTrig = function(x) {x = +x / Math.TAU; return (x - floor(x + 0.5)) * 2};

	/**
	*triangular
	*@param {number} x
	*@return {number}
	*/
	Math.triangleTrig = function(x) {return abs(Math.sawTrig(+x + Math.PI / 2)) * 2 - 1};

	//square wave defined as piecewise
	//because Math.sign(Math.sin(x)) is inefficient
	Math.squareTrig = function(x)
	{
		x = Math.mod(x, Math.TAU); //normalize
		//is -0 returned correctly?
		return x && sign(Math.PI - x)
	};

	//https://math.stackexchange.com/a/1019099
	//semicircular cicloid
	Math.circleTrig = function(x)
	{
		x = Math.mod(x, Math.TAU);
		const F = x => sqrt(1 - (x / (Math.PI / 2) - 1) ** 2);
		return x < Math.PI ? F(x) : -F(x - Math.PI)
	};
	//missing periodic Gauss and arcsin, but It's not important

	//count trailing zeros in binary
	const ctz = n =>
	{
		const B = typeof n == 'bigint', U = B ? 1n : 1;
		let c = U ^ U;
		while (!(n & U)) {c += U; n = B ? n >> 1n : n >>> 1}
		return c
	};
	//logarithmic binary search is faster than linear, but the engine will do it for us
	Math.ctz32 = function(x) {return ctz(+x >>> 0)};

	BigInt.ctz = function(n) {if (n = toBigInt(n)) return ctz(n); throw new RangeError('return value is Infinity')};

	Numeric.ctz = function(n)
	{
		n = toNumeric(n);
		if (typeof n == 'bigint') return n ? ctz(n) : Infinity;
		n = trunc(abs(+n));
		if (isInfNan(n)) return NaN;
		if (!n) return 0x400; //(rounded) `Math.log2(Number.MAX_VALUE)` = (truncated) ilb(2 ^ 1024 - 1) + 1
		if (n % 2) return 0;
		n = Number.castBigInt(n);
		const e = ((n >> 52n) & 0x3ffn) - 51n; //get exponent
		n &= ~(-1n << 52n); //mask mantissa
		n = n ? ctz(n) : 52n;
		return Number(e + n)
		/*
		//the following algorithm is ditched because I doubt it's efficient.
		//It's kept here for historical and educational purposes.
		const c = trunc(Math.log2(n)) - 52;
		if (c > 0) n /= 2 ** c; //remove all but the most significant 53b
		//floats larger than 53b always have trailing zeros, so there's no need for `trunc`
		return (c > 0 && c) + Math.ctz32(n) + (n | 0 ? 0 : n >= 2 ** 32 && Math.ctz32(n / 2 ** 32))
		*/
	};

	Numeric.isDivisible = function(n, d)
	{
		n = n?.valueOf(); d = d?.valueOf();
		return typeof n == typeof d && isInt(n) && isInt(d) && d && !(n % d)
	};

	const isPow2 = x => n > 1 && !(n & (n - 1n));

	BigInt.isPow2 = function(n) {return isBigInt(n) && n > 1n && !(n & (n - 1n))};

	BigInt.isMersenne = function(n) {return isBigInt(n) && n > 0n && !(n & (n + 1n))};

	Math.isPow2 = function(n)
		{return isInt(n = +n) && BigInt.isPow2(BigInt(n))};
	//every unsafe int has trailing zeros
	Math.isMersenne = function(n)
		{return isInt(n = +n) && n < 2 ** 53 && BigInt.isMersenne(BigInt(n))};

	//for educational purposes see: en.wikipedia.org/wiki/Hamming_weight#Efficient_implementation
	//without optimization, this is very slow
	const popcnt = x =>
	{
		const B = typeof x == 'bigint';
		let c = B ? 0n : 0;
		while (x) {c += x & (B ? 1n : 1); x = B ? x >> 1n : x >>> 1}
		return c
	};
	
	Math.popcnt32 = function(x) {return popcnt(+x >>> 0)};
	
	BigInt.popcnt = function(n)
	{
		if ((n = toBigInt(n)) < 0n) throw new RangeError('return value is Infinity')
		return popcnt(n)
	};

	Numeric.popcnt = function(n)
	{
		n = toNumeric(n);
		if (typeof n == 'bigint') return n < 0n ? Infinity : popcnt(n);
		if (isInfNan(n)) return NaN;
		n = abs(trunc(+n));
		//mantissa popcount, because exponent doesn't matter
		return Number(popcnt(Number.castBigInt(n) & ~(-1n << 52n)) + 1n)
	};

	//bitwise (logical base 2, not artihmetic) carryless multiplication
	Math.clmul32 = function(x, y)
	{
		x = +x >>> 0; y = +y >>> 0;
		let prod = 0;
		while (y)
		{
			prod ^= (y & 1) && x;
			y >>>= 1;
			x <<= 1;
		}
		return prod >>> 0
	};
	//IDK if the naive definition is fast
	BigInt.clmul = function(a, b)
	{
		a = toBigInt(a); b = toBigInt(b);
		//can it be defined?
		if (a < 0n || b < 0n) throw new RangeError('negative carryless product is undefined');
		let out = 0n;
		while (b)
		{
			out ^= (b & 1n) && a;
			b >>= 1n;
			a <<= 1n;
		}
		return out
	};

	Numeric.clmul = function(a, b)
	{
		a = toNumeric(a); b = toNumeric(b);
		if (a < 0 || b < 0 || isInfNan(a) || isInfNan(b))
			return NaN;
		if (typeof a != 'bigint') a = BigInt(a - a % 1);
		if (typeof b != 'bigint') b = BigInt(b - b % 1);
		return BigInt.clmul(a, b)
	};

	Math.isSquare = function(n)
	{
		n = +n;
		if (n % 1 != 0) return false;
		if (n < 2) return n >= 0;
		const ctz = Numeric.ctz(n);
		if (ctz % 2) return false;
		n /= 2 ** ctz;
		if (n == 1) return true;
		if (n % 8 != 1) return false;
		return sqrt(n) % 1 == 0
	};

	BigInt.isSquare = function(n)
	{
		if (!isBigInt(n)) return false
		if (n < 2n) return n >= 0n
		const c = ctz(n);
		if (c & 1n) return false
		n >>= c;
		if (n & 7n != 1n) return false
		return sqrt(n) ** 2n == n
	};

	Numeric.isSquare = function(n)
	{
		if (!Numeric.isInteger(n)) return false;
		return (isBigInt(n) ? BigInt : Math).isSquare(n)
	};

	Math.isCube = function(n)
	{
		n = abs(+n);
		if (!isInt(n)) return false;
		if (!n) return true;
		const ctz = Numeric.ctz(n);
		if (ctz % 3) return false;
		n /= 2 ** ctz;
		//math.stackexchange.com/a/2190888
		if (!([0, 1, 8].includes(n % 9) && [0, 1, 6].includes(n % 7)))
			return false;
		return cbrt(n) % 1 == 0
	};

	BigInt.isCube = function(n)
	{
		if (!isBigInt(n)) return false
		if (!n) return true
		const c = ctz(n);
		if (c % 3n) return false
		//shifting must be done before abs,
		//this allows the engine to reuse the shifted local copy of `n` inside `ctz`
		n >>= c;
		/*
		`abs` (and "abs") is O(n) in worst-case only, so we must use it sparingly.
		By using it just before `if`, the max number of comparisons is reduced.
		Inverting the math sign of an odd number doesn't need sum, just "OR" (~n | 1n).
		But we can reduce those 2 ops down to 1. XORing with minus-two flips all bits except LSB
		bitwise ops are parallelizable, increasing potential speed
		*/
		if (n < 0n) n ^= -2n; //abs
		if ((n % 9n > 1n && n % 9n != 8n) && (n % 7n > 1n && n % 7n != 6n)) return false
		//if ( !([0n, 1n, 8n].includes(n % 9n) && [0n, 1n, 6n].includes(n % 7n)) ) return false
		return cbrt(n) ** 3n == n
	};

	Numeric.isCube = function(n) {return Numeric.isInteger(n) && (isBigInt(n) ? BigInt : Math).isCube(n)};

	/**
	*Euclidean algorithm for finding Highest Common Factor.
	*returns correct values when inputs are rational numbers
	*whose denominators are any power of 2 (including 2**0)
	*@param {numeric} a
	*@param {numeric} b
	*@return {numeric}
	*/
	const Euclid = (a, b) => {while (b) [a, b] = [b, a % b]; return a};

	/**
	*@param {number} a
	*@param {number} b
	*@return {number}
	*/
	Math.gcd = function(a, b)
	{
		a = abs(+a); b = abs(+b);
		if (isNan(a) || isNan(b)) return NaN
		if (!isInt(a) || !isInt(b)) return Euclid(a, b)
		//borrowed from Stein, lol
		const i = Numeric.ctz(a), j = Numeric.ctz(b),
			k = i < j ? i : j; //min
		//ensure the max length is 53b
		a /= 2 ** i; b /= 2 ** j;
		return (Math.isMersenne(a) && Math.isMersenne(b)
			? 2 ** Math.gcd(trunc(Math.log2(a)) + 1, trunc(Math.log2(b)) + 1) - 1
			: Euclid(a, b)) * 2 ** k
	};
	/**
	*BEHOLD THE ULTIMATE GCD ALGORITHM
	*@param {bigint} a
	*@param {bigint} b
	*@return {bigint}
	*/
	BigInt.gcd = function(a, b)
	{
		//simplify future operations
		a = abs(toBigInt(a)); b = abs(toBigInt(b));
		if (a == b || !a) return b; if (!b) return a;
		if (abs(a - b) == 1n) return 1n; //does this improve speed?
		const i = ctz(a), j = ctz(b), k = i < j ? i : j; //min
		//reduce sizes
		a >>= i; b >>= j;
		//REMINDER: every `return` after this point MUST be shifted by `k` to the left
		if (a == b) return a << k; //again, does this improve speed?
		/*
		Stein's algorithm is slow when any argument is 1,
		especially if the other argument is a big Mersenne.
		So return early when any value is 1
		*/
		if (a == 1n || b == 1n || abs(a - b) == 1n) return 1n << k;
		/*
		Stein alg made me realize that the
		GCD of 2 Mersenne numbers is another Mersenne
		whose size (exponent) equals the GCD of the sizes of the args.
		Example: GCD(0b111111, 0b11111111) = 0b11
		because GCD(6, 8) = 2.
		In case you didn't know,
		`bigMersenne - smallMersenne == bigMersenne ^ smallMersenne`.
		I did some research and apparently it works for ANY base, not just 2:
		math.stackexchange.com/a/11570
		*/
		if (BigInt.isMersenne(a) && BigInt.isMersenne(b))
			return ~(-1n << BigInt.gcd(BigInt.log2(a) + 1n, BigInt.log2(b) + 1n)) << k;

		//set base ("Beta") of Lehmer's algo to `2 ** (2 ** BIN)`
		const BIN = 8n;

		if (b > a) [a, b] = [b, a];
		const a_len = sizeOf(a, 1n << BIN, 1n),
			b_len = sizeOf(b, 1n << BIN, 1n);
		if (b_len < 2)
		{
			//both are small, Euclid is best here
			if (a_len < 2) return Euclid(a, b) << k;
			/*
			else: the larger is too large
			but the smaller is too small,
			so use Stein alg:
			en.wikipedia.org/wiki/Binary_GCD_algorithm#Implementation
			*/
			for(;;) //`undefined == true` lol
			{
				if (a > b) [a, b] = [b, a];
				b -= a;
				if (!b) return a << k;
				b >>= ctz(b)
			}
		}
		/*
		else: BOTH TOO LARGE
		definitely use Lehmer's algorithm
		en.wikipedia.org/wiki/Lehmer%27s_GCD_algorithm#Algorithm
		*/
		let m = a_len - b_len;
		//this will sometimes make `b > a` true, I will fix it soon
		b <<= m << BIN; m = a_len;
		while (a && b)
		{
			m--;
			let x = a >> (m << BIN),
				y = b >> (m << BIN),
				[A, B, C, D] = [1n, 0n, 0n, 1n];
			for(;;)
			{
				let w0 = (x + A) / (y + C),
					w1 = (x + B) / (y + D),
					w;
				//I'm afraid of deleting the `else` lol
				if (w0 != w1) {break} else w = w0;
				[A, B, x,
				C, D, y] = [
					C, D, y,
					A - w*C, B - w*D, x - w*y
				];
				if (B) continue;
			}
			if (!B)
			{
				//is the order correct? if a < b, this will just swap them
				if (b) [a, b] = [b, a % b];
				continue
			}
			[a, b] = [a*A + b*B, C*a + D*b];
			if (b) continue;
		}
		return a << k
	}


	Numeric.gcd = function(a, b)
	{
		a = abs(toNumeric(a)); b = abs(toNumeric(b));
		return isBigInt(a) && isBigInt(b) ? BigInt.gcd(a, b) : Math.gcd(a, b)
	};
	//should `abs` be a tail-call in all of these (GCDs and LCMs)? it seems better to use it at the start
	Math.lcm = function(x, y)
	{
		x = abs(+x); y = abs(+y);
		return x / Math.gcd(x, y) * y
		//lower overflow probability than `a * b / Math.gcd(a, b)`
	};

	BigInt.lcm = function(a, b)
	{
		a = abs(toBigInt(a)); b = abs(toBigInt(b));
		return a / BigInt.gcd(a, b) * b
		//better performance than `a * b / BigInt.gcd(a, b)`
	};

	Numeric.lcm = function(a, b)
	{
		a = abs(toNumeric(a)); b = abs(toNumeric(b));
		return a / Numeric.gcd(a, b) * b
	};

	//2nd lowest common divisor
	//the 1st is always 1
	Numeric.lcd = function(a, b)
	{
		a = abs(toNumeric(a)); b = abs(toNumeric(b));
		const rt = Numeric.sqrt(a * b), ONE = isBigInt(a) ? 1n : 1;
		for (let i = ONE + ONE; i <= rt; i++) if (!(a % i || b % i)) return i;
		return ONE
	};

	Math.agm = function(x, y)
	{
		x = +x; y = +y;
		//avoid infinite loop
		if (isNan(x) || isNan(y) || x < 0 || y < 0) return NaN
		let a;
		do [x, y, a] = [(x + y) / 2, sqrt(x * y), x]
		while (x != a) //this condition allows max precision
		//and prevents infinite loop caused by rounding error
		return x
	};

	//returns non-trivial divisors (proper divs) of x
	Math.divisors = function(x)
	{
		x = trunc(abs(+x));
		if (isInfNan(x)) return;
		if (x < 2) return [];
		const c = Numeric.ctz(x);
		//prevent infinite loop, increase sqrt accuracy, and improve overall speed
		x /= 2 ** c;
		const m = sqrt(x), out = [];
		let i;
		for (i = 3; i <= m; i += 2)
			if (!(x % i)) out.push(i);
		i = out.length - Math.isSquare(x) - 1;
		while (i >= 0) out.push(x / out[i--]);
		const bin = []; //unique powers of 2
		for (i = 1; i <= c; i++) bin.push(2 ** i);
		//TO-DO: add and fix missing multiplication and insertion
		return out.sort((a, b) => a - b)
	};

	//array of sorted Primes, no gaps (dense)
	const Pa = [3, 5], //2 is unnecessary because CTZ
	//Primality "dictionary", any order, gaps allowed (sparse)
		Pd = new Set([2, 3, 5]),
	//find next prime and store it
		addP = function()
		{
			let x = Pa.at(-1) + 2;
			loop:
			for (let j;; x += 2)
			{
				if (Pd.has(x)) break;
				if (Math.isSquare(x)) continue;
				j = 0;
				while (Pa[j] <= sqrt(x))
					if (x % Pa[j++] == 0) continue loop;
				Pd.add(x); break;
			}
			Pa.push(x)
		};
	//remember, those 3 constants are static, so their data is preserved between calls to `factorize`

	Math.factorize = function(x)
	{
		x = trunc(abs(+x));
		if (isInfNan(x)) return; //returning `undefined` is "more correct"
		const out = new Map, ctz = Numeric.ctz(x);
		if (ctz) {out.set(2, ctz); x /= 2 ** ctz}
		if (x < 2) return out;
		let rt = 1, y = sqrt(x);
		//trial rooting
		while (Math.isSquare(x)) {x = y; y = sqrt(y); rt *= 2}
		y = cbrt(x);
		while (Math.isCube(x)) {x = y; y = cbrt(y); rt *= 3}
		if (Pd.has(x)) {out.set(x, rt); return out}
		let i = 0; y = sqrt(x);
		//trial division on steroids
		while (Pa[i] <= y && Pa[i] <= x)
		{
			while (x % Pa[i] == 0)
			{
				out.set(Pa[i], (out.get(Pa[i]) || 0) + rt);
				x /= Pa[i];
				if (Pd.has(x))
				{
					out.set(x, (out.get(x) || 0) + rt);
					return out
				}
			}
			if (++i >= Pa.length) addP(); //Primes on-demand
		}
		if (x > 1) {out.set(x, (out.get(x) || 0) + rt); Pd.add(x)}
		return out
	};

	//factorial approximation for non-integers
	const Gosper = x => sqrt((+x + 1 / 6) * Math.TAU) * (x / Math.E) ** x;
	//improvement of Stirling

	//Gamma Function (+1) defined as Summation instead of Integration
	const Gamma = x =>
	{
		let t = 1, s0, s1 = 0 ** x;
		do {s0 = s1; s1 += t ** x * exp(-t); t++}
		while (s0 != s1)
		return s0
	};

	//missing Lanczos approx

	//`F` is to allow selection of preferred function
	Math.factorial = function(x, F)
	{
		x = +x;
		if (x == Infinity) return x;
		if (isInfNan(x)) return NaN;
		if (x % 1) return (F ? Gosper : Gamma)(x);
		let s, out = 1;
		[s, x] = signSplit(x);
		for (let i = 2; i <= x; i++) out *= i;
		return out * (x % 2 ? s : 1)
	};

	BigInt.factorial = function(n)
	{
		n = toBigInt(n);
		let s, out = 1n, a = 0n, c;
		[s, n] = signSplit(n);
		for (let i = 2n; i <= n; i++)
		{
			a += c = ctz(i);
			//reduce size (temporarily) in the hope of being faster
			out *= i >> c
		}
		return out * (n & 1n ? s : 1n) << a
		/*
		this algorithm isn't good for BigInts
		these are better:
		http://www.luschny.de/math/factorial/FastFactorialFunctions.htm
		github.com/PeterLuschny/Fast-Factorial-Functions
		https://web.archive.org/web/20050211005140/http://www.luschny.de/math/factorial/Description.htm
		*/
	};
	//TO-DO: add rising and falling Fs
	Numeric.factorial = function(x, k = 1)
	{//if k > 1 returns multifactorial of that degree
		x = signSplit(toNumeric(x));
		k = toNumeric(k);
		if (!isBigInt(k)) k = trunc(k);
		k = x[0] * k; x = x[1];
		const out = [isBigInt(x) ? 1n : 1];
		for (let i = k; out.length <= x; i += k) out.push(i * out.at(-1));
		return out.at(-1) //yes, memory is being wasted
	};

	//iterative inverse int Fact
	Numeric.factorial_inv = function(n, k = 1)
	{//if k > 1 returns corresponding inv multifactorial
		n = toNumeric(n); k = toNumeric(k);
		if (!n || isNan(k)) return NaN;
		if (isInfNan(n)) return n;
		let x = sign(n);
		if (!k) return x;
		while (abs(n) > 1) {n /= x; x += k}
		return x
	};


	//"Termial/Additorial/Sumatorial" Fs
	//en.wikipedia.org/wiki/Triangular_number ; en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF

	//get Nth "TriNumber" fast
	Numeric.triNum = function(x)
	{
		x = toNumeric(x);
		const ONE = isBigInt(x) ? 1n : 1, TWO = ONE + ONE;
		//this approach is slightly faster
		return x % TWO
			? (x + ONE) / TWO * x
			: x / TWO * (x + ONE)
	};

	//get index of a trinum
	Numeric.triNum_inv = function(x)
	{
		return isBigInt(x = toNumeric(x))
			? (BigInt.sqrt((x << 3n) | 1n) - 1n) >> 1n
			: (sqrt(8 * x + 1) - 1) / 2
	};

	//get TriNums up to index x (inclusive)
	Numeric.triSeq = function(x)
	{
		x = signSplit(toNumeric(x));
		const out = [x ^ x]; //auto-type Zero
		for (let i = x[0]; out.length <= x[1]; i += x[0]) out.push(i + out.at(-1));
		return out
	};

	//get Nth Fibonacci faster than recursion
	Math.Fib = function(x)
	{
		x = signSplit(+x);
		return round(Math.PHI ** x[1] / Math.SQRT5) * (x[0] == -1 && x[1] % 2 == 0 ? -1 : 1)
	};
	//en.wikipedia.org/wiki/Generalizations_of_Fibonacci_numbers#Extension_to_negative_integers

	/**
	*get index of a Fib num
	*@param {mumber} x Fib num to find the index
	*@return {number}
	*/
	Math.Fib_inv = function(x)
	{
		x = signSplit(+x);
		const i = floor(Math.logPHI(x[1] * Math.SQRT5 + 0.5))
		return !(i % 2) && x[0] == -1 ? NaN : i * x[0]
	};

	//en.wikipedia.org/wiki/Lucas_sequence
	//co-recursive Lucas function
	//If F is falsy (default) then "U", else "V"
	Numeric.Lucas = function(n, P = 1, Q = -1, F)
	{
		const f = Numeric.to;
		n = f(n); P = f(P); Q = f(Q);
		const seq = isBigInt(P) && isBigInt(Q)
			? (F ? [2n, P] : [0n, 1n])
			: (F ? [2, P] : [0, 1]);
		while (seq.length <= n)
			seq.push(P * seq.at(-1) - Q * seq.at(-2));
		return seq
	};

	//TO-DO: maybe insert Dot-Product here


	//correction of data descriptors
	//to make everything equal to vanilla JS
	for (const O of [Number, Math, BigInt, Numeric])
	{
		//`for in` is slower and has more potential side-effects
		for (const k of Object.keys(O))
		{
			defProp(O, k, O[k], +(typeof O[k] == 'function') && 0b101)
			if (typeof O[k] == 'function') defProp(O[k], 'name', O[k].name || k, 1);
		}
	}
})(Math.random, Math.sin, Math.exp)
