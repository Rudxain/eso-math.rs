//IIFE with closure
(function(sin, sqrt)
{
	'use strict';
	const isPrimitive = x => x === null || !(typeof x == 'object' || typeof x == 'function');

	/**
	*Shorter
	*@param {object} O Object to modify
	*@param {string} k key (property name) to define
	*@param {*} v value to set
	*@param {(boolean[]|numeric|string)} a descriptor
	*/
	const defProp = function(O, k, v, a)
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
		return Object.defineProperty(O, k, {value: v, writable: !!a[0], enumerable: !!a[1], configurable: !!a[2]})
	};

	//for non-Deno environments
	const AssertionError = class extends Error {constructor(m) {super(m)}};
	const assert = function(c, m) {if (!c) throw new AssertionError(m)};

	//github.com/tc39/proposal-relative-indexing-method#polyfill
	function at(n)
	{
		//throw the same error as built-in implementation
		if (this === null || this === undefined)
			throw new TypeError('Cannot convert undefined or null to object');
		let l = this.length;
		//BigInt (and object-wrapped bigint) support
		if (isBigInt(n)) l = BigInt(l)
		else n = trunc(+n) || 0; //toIntegerOrInfinity
		if (n < 0) n += l; //very convenient
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
		switch (typeof x?.valueOf())
		{
			case 'string': case 'boolean': case 'bigint': return BigInt(x);
			default: throw new TypeError(`Cannot convert ${x} to BigInt`)
		}
	};

	//localization increases performance, and protects against external side-effects
	const abs = x => x < 0 || isNegZero(x) ? -x : x,
		sign = x => {const ONE = (x ^ x) ** (x ^ x); return x && (x < 0 ? -ONE : ONE)},
		isInf = x => x === Infinity || x === -Infinity,
		isNan = x => x != x, //THERE'S NO TYPO. Last "n" is lowercase to avoid confusion.
		isInfNan = x => isInf(x) || isNan(x), //!isFinite(x)
		isInt = x => (isNumber(x) && x % 1 == 0) || isBigInt(x),
		trunc = x => isInt(x) ? x : x - x % 1,
		floor = x => isInt(x) ? x : trunc(x) - (x < 0 ? 1 : 0);

		assert(isNegZero(floor(-0)))
		assert(isNegZero(trunc(-0)))

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
		value = value?.valueOf();
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
		if (typeof x == 'string' && x.includes('.')) return BigInt(x.su(x.indexOf('.')));
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
			if (!isInfNan(x))
				{e = x && trunc(logB(abs(x), b)); x = x / b ** e}
			else
				{e = x; x = sign(x)}
			return x.toString(b) + ' * ' + '10' + '^' + e.toString(b) + ` (base 0d${b})`
		},
		0b101
	)

	//Summation with minimal rounding errors
	//KahanBabushkaKleinSum
	Math.sum = function(...values)
	{
		values = values.map(x => +x);
		let sum = 0, cs = 0, ccs = 0, c = 0, cc = 0;
		for (let i = 0; i < values.length; i++)
		{
			let t = sum + values[i];
			c = abs(sum) >= abs(values[i])
				? (sum - t) + values[i]
				: (values[i] - t) + sum;
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


	Math.TAU = Math.PI * 2; //no accuracy loss
	//because multiplier is power of two

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
	Number.signbit = function(x)
		{return typeof x == 'number' && x == x && x < 0 || isNegZero(x)};

	//for consistency, no static method will be an arrow function
	BigInt.sign = function(n) {return sign(toBigInt(n))};
	BigInt.abs = function(n) {return abs(toBigInt(n))};

	Numeric.sign = function(x) {return sign(toNumeric(x))};
	Numeric.abs = function(x) {return abs(toNumeric(x))};

	Numeric.signSplit = function(x) {return [Numeric.sign(x), Numeric.abs(x)]}; //should be reversed order

	BigInt.max = function(...a)
	{
		a = a.map(toBigInt);
		let i = 0, m = a[i];
		while (++i < a.length)
			if (a[i] > m) m = a[i];
		return m
	};
	BigInt.min = function(...a)
	{
		a = a.map(toBigInt);
		let i = 0, m = a[i];
		while (++i < a.length)
			if (a[i] < m) m = a[i];
		return m
	};

	Numeric.max = function(...values)
	{
		const a = values.map(toNumeric);
		let i = 0, m = a[i];
		while (++i < a.length)
			if (a[i] > m) m = a[i];
		return m
	};
	/*
	TO-DO: return a number only if it's safe, otherwise bigint.
	Only do that if there's multiple valid choices.
	*/
	Numeric.min = function(...values)
	{
		const a = values.map(toNumeric);
		let i = 0, m = a[i];
		while (++i < a.length)
			if (a[i] < m) m = a[i];
		return m
	};

	const clamp = (x, min, max) =>
	{
		if (min > max) [min, max] = [max, min];
		return x > max ? max : x < min ? min : x
	};

	Math.clamp = function(x, min, max) {return clamp(+x, +min, +max)};

	BigInt.clamp = function(x, min, max) {return clamp(toBigInt(x), BigInt(min), BigInt(max))};

	Numeric.clamp = function(x, min, max) {return clamp(toNumeric(x), toNumeric(min), toNumeric(max))};

	//github.com/zloirock/core-js/blob/master/packages/core-js/internals/math-scale.js
	//https://rwaldron.github.io/proposal-math-extensions/#sec-math.scale
	Math.scale = function(x, inLow, inHigh, outLow, outHigh)
	{
		x = +x; if (isInfNan(x)) return x;
		//throw on BigInt and
		//avoid string concatenation if `outLow` is text
		inLow = +inLow; inHigh = +inHigh;
		outLow = +outLow; outHigh = +outHigh;
		return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow
	};

	//round towards unsigned (any) Infinity
	Math.roundInf = function(x) {return Math[+x < 0 ? 'floor' : 'ceil'](x)};

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
		n = +n; b = +b & 31;
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

	BigInt.sizeOf = function(n, b = 8)
	{//b is the unit of measurement. 1: bit, 8: Byte, 16: word, 32: D-word, 64: Q-word
		n = abs(toBigInt(n)); b = abs(BigInt(b)); //exclude sign bit
		//what's the size of 0? 0 or 1?
		let i = 1n;
		while (n >>= b) i++;
		return i
	};

	BigInt.log2 = function(n) //lb(bigint)
	{
		n = toBigInt(n);
		if (n <= 0n) throw new RangeError('Non-positive logarithmation');
		//linear word search
		let i = 0n, B = 0x40n; //`B` MUST be a power of 2
		while (n >> B) {n >>= B; i += B}
		let w = (-1n << (B >> 1n)) & ~(-1n << B);
		//binary search
		while (B >>= 1n)
		{
			//`|=` == `+=` but faster
			if (n & w) {i |= B; n >>= B}
			w = (w >> B) & (-1n << (B >> 1n));
		}
		//I rolled the loop because it'll probably be unrolled anyway.
		//this "rolling" allows changing `B` without editing extra code
		return i
	};

	BigInt.logB = function(n, b = 3n)
	{
		n = toBigInt(n); b = BigInt(b);
		if (n < 1n || b < 2n) throw new RangeError('return value is -Infinity or NaN');
		let i = 0n;
		while (n > 1n) {n /= b; i++}
		return i
	};

	Numeric.logB = function(x, b = 2)
	{
		x = toNumeric(x); b = toNumeric(b);
		if (x != x || b != b || x < 0 || b <= 1) return NaN;
		if (x == 0) return -Infinity;
		if (x == 1) return 0;
		return (isBigInt(x) && isBigInt(b) ? BigInt : Math).logB(x, b)
	};

	Math.root = function(x, n = 2) {return (+x) ** (1 / +n)};

	BigInt.root = function(n, i = 2n)
	{//ith (degree i) root of n
		n = toBigInt(n); i = BigInt(i);
		if (i == 1n) return n;
		n = Numeric.signSplit(n);
		if (!i) {if (n[1] > 1n) throw new RangeError('return value is NaN'); return 0n}
		if (n[0] === -1n && !(i & 1n)) throw new RangeError('return value is a Complex number');
		if (i < 0n) {if (!n[1]) throw new RangeError('return value is Infinity'); return n[1] == 1n ? n[0] : 0n}
		if (!n[1]) return 0n;
		const j = i - 1n, log = BigInt.log2(n[1]);
		//a ^ (1 / k) = b ^ (log_b(a) / k)
		let x0 = n >> (log - log / i),
			 x1 = x0 * j / i + n[1] / (i * x0 ** j);
		while (x1 < x0)
		{//Newton's Method
			x0 = x1;
			x1 = x1 * j / i + n[1] / (i * x1 ** j)
		}
		return x0 * n[0]
	};

	Numeric.root = function(x, n)
	{
		x = toNumeric(x); n = toNumeric(n);
		if (x != x || n != n) return NaN;
		const a = Numeric.abs(x), zero = x ^ x;
		if (!n) return a > 1 ? NaN : zero;
		if (x < 0 && (isBigInt(n) && !(n & 1n))) return NaN;
		if (n < 0) return a ? (a == 1 ? Numeric.sign(x) : zero) : Infinity;
		if (!a) return zero;
		return (isBigInt(x) && isBigInt(n) ? BigInt : Math).root(x, n)
	};

	BigInt.sqrt = function(n)
	{//Heron's Method
		n = toBigInt(n);
		if (n < 2n) {if (n < 0n) throw new RangeError('return value is Complex number'); return n}
		let x0 = n >> (BigInt.log2(n) >> 1n),
			 x1 = (x0 + n / x0) >> 1n;
		while (x1 < x0)
		{
			x0 = x1;
			x1 = (x1 + n / x1) >> 1n
		}
		return x0
	};

	/**
	*@param {*} x
	*@return {numeric}
	*/
	Numeric.sqrt = function(x)
		{return (x = toNumeric(x)) < 0 ? NaN : (isBigInt(x) ? BigInt : Math).sqrt(x)};

	//get random int32
	Math.random32 = function() {return Math.random() * 2 ** 32 | 0};

	//get random non-negative safe integer
	Math.randomSafe = function()
	{
		/*
		only 52bits are generated by `Math.random`,
		so "rand() << 53" must be used to have space for the missing bit.
		a bool is enough to fill it (the LSB)
		*/
		return Math.random() * 2 ** 53 + (Math.random() < 0.5);
	};

	//interval [0, n), or (n, 0] if negative
	//by default, it returns an uInt64
	BigInt.random = function(n = 1n << 0x40n)
	{
		n = toBigInt(n);
		const b = BigInt.sizeOf(n, 1n),
			neg = n < 0n;
		if (neg) n = -n;
		let l = 1n, x = 0n; //l = size of x
		while (l <= b)
		{
			x <<= 53n;
			l += 53n;
			//getRandomValues is overkill
			x |= BigInt(Math.randomSafe())
		}
		const s = l - b - 1n;
		//remove bias (kinda, because XORing just 1 block introduces more bias)
		x >>= s; l -= s;
		const MAX = ~(-1n << l);
		while (x >= MAX - MAX % n)
			x ^= BigInt(Math.randomSafe());
		x %= n;
		return neg ? -x : x
	};

	//Euclidean division
	Math.divEuclid = function(x, y) {return floor(x / abs(+y)) * sign(+y)};
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
	//TO-DO: do not use "multi-mod", make each one independent,
	//and only add floor and euclid, discard round and ceil

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
	Math.sawTrig = function(x)
	{
		x = +x / Math.TAU;
		return (x - floor(x + 0.5)) * 2
	};

	/**
	*triangular
	*@param {number} x
	*@return {number}
	*/
	Math.triangleTrig = function(x)
		{return abs(Math.sawTrig(+x + Math.PI / 2)) * 2 - 1};

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


	Math.ctz32 = (function(clz) {return function(x) {return (x = +x) | 0 ? 31 - clz(x & -x) : 32}})(Math.clz32);
	//count trailing zeros in binary
	BigInt.ctz = function(n)
	{
		n = toBigInt(n);
		if (!n) throw new RangeError('return value is Infinity');
		//`b` MUST be a power of 2
		let i = 0n, b = 0x40n, w = ~(-1n << b);
		//linear word search
		while (!(n & w)) {i += b; n >>= b}
		//release memory, and
		n &= w; //increase probability of fixed-precision optimization
		//binary search
		while (b >>= 1n) if (!(n & (w >>= b))) {i |= b; n >>= b};
		return i
	};

	Numeric.ctz = function(n)
	{
		n = toNumeric(n);
		if (typeof n == 'bigint') return n ? BigInt.ctz(n) : Infinity;
		n = trunc(abs(+n));
		if (isInfNan(n)) return NaN;
		if (!n) return 0x400; //(rounded) `Math.log2(Number.MAX_VALUE)` = (truncated) ilb(2 ^ 1024 - 1) + 1
		if (n % 2) return 0;
		n = Number.castBigInt(n);
		const e = ((n >> 52n) & 0x3ffn) - 51n; //get exponent
		n &= ~(-1n << 52n); //mask mantissa
		n = n ? BigInt.ctz(n) : 52n;
		return Number(e + n)
		/*
		//the following algorithm is ditched
		//because I doubt it's efficient.
		//It's kept here for historical purposes
		const c = trunc(Math.log2(n)) - 52;
		if (c > 0) n /= 2 ** c; //remove all but the most significant 53b
		//floats larger than 53b always have trailing zeros
		//so there's no need for `trunc`
		assert(n % 1 == 0) //ensure it's an int, JIC
		return (c > 0 && c) +
			Math.ctz32(n) +
			(n | 0 ? 0
				: n >= 2 ** 32 && Math.ctz32(n / 2 ** 32))
		*/
	};

	Numeric.isDivisible = function(n, d)
	{
		n = n?.valueOf(); d = d?.valueOf();
		return typeof n == typeof d && Numeric.isInteger(n) && Numeric.isInteger(d) && d && !(n % d)
	};

	BigInt.isPow2 = function(n) {return isBigInt(n) && n > 1n && !(n & (n - 1n))};

	BigInt.isMersenne = function(n) {return isBigInt(n) && n > 0n && !(n & (n + 1n))};

	Math.isPow2 = function(n)
		{return (n = +n) % 1 == 0 && BigInt.isPow2(BigInt(n))};
	//every unsafe int has trailing zeros
	Math.isMersenne = function(n)
		{return (n = +n) % 1 == 0 && n < 2 ** 53 && BigInt.isMersenne(BigInt(n))};

	Math.popcnt32 = function(i)
	{
		i = +i | 0;
		i -= (i >>> 1) & 0x55555555;
		i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
		i = (i + (i >>> 4)) & 0x0F0F0F0F;
		return Math.imul(i, 0x01010101) >>> 24;
	};

	BigInt.popcnt = function(n)
	{
		n = toBigInt(n);
		if (n < 0n) throw new RangeError('return value is Infinity');
		//this algorithm works best with less zeros
		n >>= n && BigInt.ctz(n);
		if (n < 2n) return n;
		let c = 0n, w = new BigUint64Array(1); //correctness and performance
		const m = 0x3333333333333333n;
		do {
			w[0] = n;
			w[0] >>= w[0] && BigInt.ctz(w[0]);
			//is this overkill?
			if (w[0] < 2n) {c += w[0]; continue}
			//en.wikipedia.org/wiki/Hamming_weight#Efficient_implementation
			w[0] -= (w[0] >> 1n) & 0x5555555555555555n;
			w[0] = (w[0] & m) + ((w[0] >> 2n) & m);
			w[0] = (w[0] + (w[0] >> 4n)) & 0x0f0f0f0f0f0f0f0fn;
			//emulate mul overflow (wraparound mod 2^64)
			w[0] *= 0x0101010101010101n;
			c += w[0] >> 56n;
		} while (n >>= 0x40n)
		return c
	};

	Numeric.popcnt = function(n)
	{
		n = toNumeric(n);
		if (typeof n == 'bigint')
			return n < 0n ? Infinity : BigInt.popcnt(n);
		if (isInfNan(n)) return NaN;
		n = abs(trunc(+n));
		//mantissa popcount, because exponent doesn't matter
		return Number(BigInt.popcnt(Number.castBigInt(n) & ~(-1n << 52n)) + 1n)
	};

	Math.clmul32 = function(a, b)
	{
		a = +a >>> 0; b = +b >>> 0;
		let out = 0;
		while (b)
		{
			out ^= (b & 1) && a;
			b >>>= 1;
			a <<= 1;
		}
		return out >>> 0
	};
	
	BigInt.clmul = function(a, b)
	{
		a = toBigInt(a); b = toBigInt(b);
		//can it be defined?
		if (a < 0n || b < 0n)
			throw new RangeError('negative carryless product is undefined');
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
		if (!isBigInt(n)) return false;
		if (n < 2n) return n >= 0n;
		const ctz = BigInt.ctz(n);
		if (ctz & 1n) return false;
		n >>= ctz;
		if (n == 1n) return true;
		if (n & 7n != 1n) return false;
		return BigInt.sqrt(n) ** 2n == n
	};

	Numeric.isSquare = function(n)
	{
		if (!Numeric.isInteger(n)) return false;
		return (isBigInt(n) ? BigInt : Math).isSquare(n)
	};

	Math.isCube = function(n)
	{
		n = abs(+n);
		if (n % 1 != 0) return false;
		if (!n) return true;
		const ctz = Numeric.ctz(n);
		if (ctz % 3) return false;
		n /= 2 ** ctz;
		if (n == 1) return true;
		//math.stackexchange.com/a/2190888
		if (!([0, 1, 8].includes(n % 9) && [0, 1, 6].includes(n % 7)))
			return false;
		return Math.cbrt(n) % 1 == 0
	};

	BigInt.isCube = function(n)
	{
		if (!isBigInt(n)) return false;
		n = abs(n);
		if (!n) return true;
		const ctz = BigInt.ctz(n);
		if (ctz % 3n) return false;
		n >>= ctz;
		if (n == 1n) return true;
		if (!([0n, 1n, 8n].includes(n % 9n) && [0n, 1n, 6n].includes(n % 7n)))
			return false;
		return BigInt.root(n, 3n) ** 3n == n
	};

	Numeric.isCube = function(n)
	{
		if (!Numeric.isInteger(n)) return false;
		return (isBigInt(n) ? BigInt : Math).isCube(n)
	};

	/**
	*Euclidean algorithm for finding Highest Common Factor.
	*returns correct values when inputs are rational numbers
	*whose denominators are any power of 2 (including 2**0)
	*@param {numeric} a
	*@param {numeric} b
	*@return {numeric}
	*/
	const Euclid = (a, b) =>
	{
		while (b) [a, b] = [b, a % b];
		return a
	};

	/**
	*@param {number} a
	*@param {number} b
	*@return {number}
	*/
	Math.gcd = function(a, b)
	{
		a = abs(+a); b = abs(+b);
		//is it really NaN?
		if (a != a || b != b) return NaN;
		if (a % 1 != 0 || b % 1 != 0) return Euclid(a, b);
		//borrowed from Stein, lol
		const i = Numeric.ctz(a), j = Numeric.ctz(b),
			k = Math.min(i, j);
		//ensure the max length = 53b
		a /= 2 ** i; b /= 2 ** j;
		return (Math.isMersenne(a) && Math.isMersenne(b)
			? 2 ** Math.gcd(Math.trunc(Math.log2(a)) + 1, Math.trunc(Math.log2(b)) + 1) - 1
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
		a = BigInt.abs(a); b = BigInt.abs(b);
		if (a == b || !a) return b; if (!b) return a;
		if (BigInt.abs(a - b) == 1n) return 1n;
		const ctz = BigInt.ctz,
			i = ctz(a), j = ctz(b),
			k = BigInt.min(i, j);
		//reduce sizes
		a >>= i; b >>= j;
		if (a == b) return a << k;
		/*
		Stein's algorithm is slow when any argument is 1,
		especially if the other argument is a big Mersenne.
		So return early when any value is 1
		*/
		if (a == 1n || b == 1n || BigInt.abs(a - b) == 1n) return 1n << k;
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
		const a_len = BigInt.sizeOf(a, 1n << BIN),
			b_len = BigInt.sizeOf(b, 1n << BIN);
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
		//this will sometimes make `b > a` true
		b <<= m << BIN;
		m = a_len;
		while (a && b)
		{
			m--;
			let x = a >> (m << BIN),
				y = b >> (m << BIN),
				[A, B, C, D] = [1n, 0n, 0n, 1n];
			for (;;)
			{
				let w0 = (x + A) / (y + C),
					w1 = (x + B) / (y + D),
					w;
				//I'm afraid of deleting the `else`
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
				//is the order correct?
				//if a < b, this will just swap them
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
		a = Numeric.abs(a); b = Numeric.abs(b); //avoid tail-calling `Numeric.to` and `Numeric.abs`
		return isBigInt(a) && isBigInt(b) ? BigInt.gcd(a, b) : Math.gcd(a, b)
	};

	Math.lcm = function(a, b)
	{
		a = abs(+a); b = abs(+b);
		return a / Math.gcd(a, b) * b
		//lower overflow probability than `a * b / Math.gcd(a, b)`
	};

	BigInt.lcm = function(a, b)
	{
		a = BigInt.abs(a); b = BigInt.abs(b);
		return a / BigInt.gcd(a, b) * b
		//better performance than `a * b / BigInt.gcd(a, b)`
	};

	Numeric.lcm = function(a, b)
	{
		a = Numeric.abs(a); b = Numeric.abs(b);
		return a / Numeric.gcd(a, b) * b
	};

	//2nd lowest common divisor
	//the 1st is always 1
	Numeric.lcd = function(a, b)
	{
		a = abs(toNumeric(a)); b = abs(toNumeric(b));
		const rt = Numeric.sqrt(a * b), u = isBigInt(a) ? 1n : 1;
		for (let i = u + u; i <= rt; i++)
			if (!(a % i || b % i)) return i;
		return u
	};

	Math.agm = function(a, g)
	{
		a = +a; g = +g;
		//avoid infinite loop
		if (a != a || g != g || a < 0 || g < 0)
			return NaN;
		let x;
		do [a, g, x] = [(a + g) / 2, sqrt(a * g), a]
		while (a != x) //this condition allows max precision
		//and prevents infinite loop caused by rounding error
		return a
	};

	BigInt.agm = function(a, g)
	{
		a = toBigInt(a); g = toBigInt(g);
		do [a, g] = [(a + g) / 2n, BigInt.sqrt(a * g)]
		while (a != g)
		return a
	};

	//Arithmetic-Geometric Mean
	Numeric.agm = function(a, g)
	{
		a = toNumeric(a); g = toNumeric(g);
		//avoid throw on negative BigInt
		if (a < 0n || g < 0n) return NaN;
		return (isBigInt(a) && isBigInt(g) ? BigInt : Math).agm(a, g)
	};

	//returns non-trivial divisors (proper divs) of n
	Math.divisors = function(n)
	{
		n = trunc(abs(+n));
		if (isInfNan(n)) return;
		if (n < 2) return [];
		const c = Numeric.ctz(n);
		//prevent infinite loop, and increase sqrt accuracy
		n /= 2 ** c;
		const m = sqrt(n), out = [];
		let i;
		for (i = 3; i <= m; i += 2)
			if (!(n % i)) out.push(i);
		i = out.length - Math.isSquare(n) - 1;
		while (i >= 0) out.push(n / out[i--]);
		const bin = []; //unique powers of 2
		for (i = 1; i <= c; i++) bin.push(2 ** i);
		//missing multiplication and insertion
		return out.sort((a, b) => a - b)
	};

	//array of sorted Primes, no gaps (dense)
	const Pa = [3, 5], //2 is unnecessary because CTZ
	//Primality "dictionary", any order, gaps allowed (sparse)
		Pd = new Set([2, 3, 5]),
	//find next prime and store it
		addP = function()
		{
			let x = +(Pa.at(-1)) + 2;
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

	Math.factorize = function(n)
	{
		n = trunc(abs(+n));
		if (isInfNan(n)) return; //returning `undefined` is "more correct"
		const out = new Map, ctz = Numeric.ctz(n);
		if (ctz) {out.set(2, ctz); n /= 2 ** ctz}
		if (n < 2) return out;
		let rt = 1, y = sqrt(n);
		//trial rooting
		while (Math.isSquare(n)) {n = y; y = sqrt(y); rt *= 2}
		y = Math.cbrt(n);
		while (Math.isCube(n)) {n = y; y = Math.cbrt(y); rt *= 3}
		let i = 1;
		while ((Math.log2(n) + 1) / Pa[i] > 3)
		{
			y = Math.root(n, Pa[i]);
			while (!(y % 1)) {n = y; y = Math.root(y, Pa[i]); rt *= Pa[i]}
			i++
		}
		if (Pd.has(n)) {out.set(n, rt); return out}
		i = 0; y = sqrt(n);
		//trial division on steroids
		while (Pa[i] <= y && Pa[i] <= n)
		{
			while (n % Pa[i] == 0)
			{
				out.set(Pa[i], (out.get(Pa[i]) || 0) + rt);
				n /= Pa[i];
				if (Pd.has(n))
				{
					out.set(n, (out.get(n) || 0) + rt);
					return out
				}
			}
			if (++i >= Pa.length) addP(); //Primes on-demand
		}
		if (n > 1) {out.set(n, (out.get(n) || 0) + rt); Pd.add(n)}
		return out
	};

	//factorial approximation for non-integers
	const Gosper = x => sqrt((+x + 1 / 6) * Math.TAU) * (x / Math.E) ** x;
	//improvement of Stirling

	//Gamma Function defined as Summation instead of Integration
	const Gamma = x =>
	{
		let t = 1, s0, s1 = 0 ** x;
		do {s0 = s1; s1 += t ** x * Math.exp(-t); t++}
		while (s0 != s1)
		return s0
	};

	//`F` is to allow selection of preferred function
	Math.factorial = function(x, F)
	{
		x = +x;
		if (x == Infinity) return x;
		if (isInfNan(x)) return NaN;
		if (x % 1) return (F ? Gosper : Gamma)(x);
		let s, out = 1;
		[s, x] = Numeric.signSplit(x);
		for (let i = 2; i <= x; i++)
			out *= i;
		return out * (x % 2 ? s : 1)
	};

	BigInt.factorial = function(n)
	{
		n = toBigInt(n);
		let s, out = 1n, a = 0n, c;
		[s, n] = Numeric.signSplit(n);
		for (let i = 2n; i <= n; i++)
		{
			a += c = BigInt.ctz(i);
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
	{//if k > 1 returns multifactorial of that degre
		x = Numeric.signSplit(x);
		k = toNumeric(k);
		if (!isBigInt(k)) k = Math.trunc(k);
		k = x[0] * k; x = x[1];
		const out = [isBigInt(x) ? 1n : 1];
		for (let i = k; out.length <= x; i += k)
			out.push(i * out.at(-1));
		return out
	};


	//iterative inverse Fact
	Numeric.factorial_inv = function(n, k = 1)
	{//if k > 1 returns corresponding inv multifactorial
		n = toNumeric(n); k = toNumeric(k);
		if (!n || isNan(k)) return NaN;
		if (isInfNan(n)) return n;
		const o = isBigInt(n) ? BigInt : Math;
		let x = o.sign(n);
		if (!k) return x;
		while (o.abs(n) > 1) {n /= x; x += k}
		return x
	};


	//"Termial/Additorial/Sumatorial" Fs
	//en.wikipedia.org/wiki/Triangular_number ; en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF

	//get Nth "TriNumber" fast
	Numeric.triNum = function(x)
	{
		x = toNumeric(x);
		const U = isBigInt(x) ? 1n : 1,
			B = U + U;
		//this approach is slightly faster
		return x % B
			? (x + U) / B * x
			: x / B * (x + U)
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
		x = Numeric.signSplit(x);
		const out = [x ^ x]; //auto-type Zero
		for (let i = x[0]; out.length <= x[1]; i += x[0])
			out.push(i + out.at(-1));
		return out
	};

	//get Nth Fibonacci faster than recursion
	Math.Fib = function(n)
	{
		n = Numeric.signSplit(+n);
		return Math.round(Math.PHI ** n[1] / Math.SQRT5) * (n[0] === -1 && n[1] % 2 === 0 ? -1 : 1)
	};
	//en.wikipedia.org/wiki/Generalizations_of_Fibonacci_numbers#Extension_to_negative_integers

	/**
	*get index of a Fib num
	*@param {mumber} x Fib num to find the index
	*@return {number}
	*/
	Math.Fib_inv = function(x)
	{
		x = Numeric.signSplit(+x);
		const i = floor(Math.logPHI(x[1] * Math.SQRT5 + 0.5))
		return !(i % 2) && x[0] === -1 ? NaN : i * x[0]
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

	//TO-DO: probably insert Dot-Product here


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
})(Math.sin, Math.sqrt)
