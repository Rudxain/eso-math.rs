//IIFE with closure, for encapsulation and localization
(function(){
	'use strict';
	const Float = Number, IntN = BigInt, Str = String,
		TypeErr = TypeError, RangeErr = RangeError, Err = Error,
		AssertionError = class extends Err {constructor(m) {super(m)}},
		//for non-Deno environments
		assert = function(c, m) {if (!c) throw new AssertionError(m)};

	/**
	*Short edition of `defineProperty`
	*@param {object} O Object to modify
	*@param {string} p key (property name) to define
	*@param {*} v value to set
	*@param {(boolean[]|numeric|string)} a bool descriptor with format [W, E, C]
	*/
	const defProp = (O, p, v, a) =>
	{
		switch (typeof a)
		{
			case 'number': a &= 7; a = [a & 4, a & 2, a & 1]; break
			case 'bigint': a &= 7n; a = [a & 4n, a & 2n, a & 1n]; break
			case 'string': a = [/w/i.test(a), /e/i.test(a), /c/i.test(a)]; break
			//Linux chmod lol (rwx)
		}
		return Object.defineProperty(O, p, {value: v, writable: !!a[0], enumerable: !!a[1], configurable: !!a[2]})
	},
		isPrimitive = x => x === null || !(typeof x == 'object' || typeof x == 'function');

	//github.com/tc39/proposal-relative-indexing-method#polyfill
	for (const C of [Array, Str, Reflect.getPrototypeOf(Int8Array)])
		//by using a named function expression, each object will have its own deep-copy/clone of `at`,
		//it also ensures that the `name` prop returns "at"
		defProp(C.prototype, 'at', function at(n)
		{
			//throw the same error as built-in implementation
			if (this === null || this === undefined) throw new TypeErr('Cannot convert undefined or null to object');
			let l = this.length;
			if (isIntN(n)) l = IntN(l) //BigInt (and object-wrapped bigint) support
			else n = trunc(+n) || 0; //ECMAscript "toIntegerOrInfinity"
			if (n < 0) n += l; return n < 0 || n >= l ? undefined : this[n]
		}, 0b101);


	/*
	The main global numerical object.
	the name is inspired by Ecmascript's `toNumeric` abstract function.
	this is intended to work with ANY numerical value,
	so if BigFloat/BigDecimal manage to get to Stage 3 of tc39, I'll add support for them
	*/
	defProp(globalThis, 'Numeric', {}, 0b101)

	/**
	any strictly numerical value
	@typedef {(number|bigint)} numeric
	*/

	const isFloat = x => typeof x?.valueOf() == 'number';
	//check if primitive number or object-wrapped number, to ensure it can be operated as a number
	Float.isNumber = function(value) {return isFloat(value)};

	const isIntN = x => typeof x?.valueOf() == 'bigint';
	//check prim or obj-wrap BigInt (ensure operability as bigint)
	IntN.isBigInt = function(value) {return isIntN(value)};

	const isNumeric = x => isFloat(x) || isIntN(x);
	//check if any numeric value
	Numeric.isNumeric = function(value) {return isNumeric(value)};

	const isNegZero = x => x === 0 && 1 / x < 0;
	//check signed/negative zero
	Float.isMinusZero = function(number) {return isNegZero(number)};

	/**
	https://tc39.es/ecma262/multipage/abstract-operations.html#sec-tobigint
	@param {(boolean|string|bigint)} x
	@return {bigint}
	*/
	const toIntN = x =>
	{
		const B = typeof x?.valueOf();
		if (B == 'string' || B == 'boolean' || B == 'bigint') return IntN(x)
		throw new TypeErr(`Cannot convert ${x} to BigInt`)
	};

	//localization increases performance, and protects against external side-effects
	const autoN = (n, x) => (isIntN(x) ? IntN : Float)(n), //copyType, but only for Numericals
		abs = x => x < 0 || isNegZero(x) ? -x : x,
		sign = x => x && (x < 0 ? -autoN(1, x) : autoN(1, x)),
		signabs = x => [sign(x), abs(x)],
		isInf = x => x === Infinity || x === -Infinity,
		isNan = x => x != x,
		isInfNan = x => isInf(x) || isNan(x), //!isFinite(x)
		isInt = x => (isFloat(x) && x % 1 == 0) || isIntN(x),
		trunc = x => isInt(x) ? x : x - x % 1,
		floor = x => isInt(x) ? x : trunc(x) - (x < 0 ? 1 : 0),
		ceil = x => isInt(x) ? x : trunc(x) + (x > 0 ? 1 : 0),
		round = x => isInt(x) || isInfNan(x) ? x : x < 0 && x >= -0.5 ? -0 : abs(x) % 1 < 0.5 ? floor(x) : ceil(x),
		roundInf = x => (x < 0 ? floor : ceil)(x); //"complement" of `trunc`

	//TO-DO: fix wrong output when strings are large (minor bug, because the original/built-in also has it)
	globalThis.isFinite = function(value) {return isIntN(value) || !isInfNan(Float(value))};
	//both `parseInt` AND `parseFloat` never throw on bigints, so I decided to "fix" these other functions
	globalThis.isNaN = function(value) {return isNan(Float(value))};

	const IntNArr = BigUint64Array, FloatArr = Float64Array,
		castFloatToIntN = f => new IntNArr(new FloatArr([f]).buffer)[0],
		castIntNToFloat = n => new FloatArr(new IntNArr([n]).buffer)[0];
	/**
	get the internal bits (binary64 IEEE 754 representation)
	@param {number} number
	@return {bigint}
	*/
	Float.castBigInt = function(number) {return castFloatToIntN(Float(number))};

	/**
	mask the 64 LSBs and read as IEEE-754 binary64 floating-point format
	@param {bigint} n
	@return {number}
	*/
	IntN.castNumber = function(n) {return castIntNToFloat(toIntN(n))};

	//parseInt for bigints
	IntN.parse = function(string, radix)
	{
		string = Str(string).trimStart().toLowerCase();
		let sign = 1n;
		if (string) //the only falsy primitive string is empty, no need to check length
		{
			switch (string[0])
			{
				case '\x2D': sign = -1n
				case '\x2B': string = string.substring(1)
			}
		}
		radix = Float(radix) | 0; //TO-DO: fix precision loss when bigint or string
		let stripPrefix = true;
		if (radix) //it will never be NaN, no need to check for zero
		{
			if (radix < 2 || radix > 36) throw new RangeErr('Invalid base')
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
		radix = IntN(radix); end = IntN(end);
		//DO NOT REVERSE iteration order
		for (let i = end - 1n; i >= 0; i--) int += charset.get(string[end - i - 1n]) * radix ** i;
		return sign * int
	};

	//TO-DO: fix error when strings have 1 "." (dot)
	IntN.from = function(value)
	{
		if (isIntN(value)) return value.valueOf();
		if (isFloat(value)) return (value = trunc(+value)) ?
			(isInf(value) ? (value < 0 ? -1n : 1n) : IntN(value)) : 0n;
		if (!value) return 0n;
		value = value.valueOf();
		if (!value) return 0n;
		if (!isPrimitive(value)) return 1n;
		return IntN(value);
	};

	const toNumeric = x =>
	{
		if (isFloat(x)) return +x; if (isIntN(x)) return IntN(x);
		if (x === null) return 0;
		if (x === undefined || typeof (x = x.valueOf()) == 'symbol') return NaN;
		if (!isPrimitive(x)) x = Str(x);
		if (!+x || abs(+x) < 2 ** 53 ||
			//I know /\s/ exists, but `trim` is faster and more readable
			/^[-+]?Infinity$/.test(Str(x).trim())) return +x;
		if (typeof x == 'string' && x.includes('.')) return IntN(x.substring(0, x.indexOf('.')));
		return IntN(x)
	};
	/**
	Coerce to numeric by using the least invasive/intrusive algorithm I know.
	DO NOT confuse with ES' `toNumeric` "abstract operation", it's not the same
	@param {*} value
	@return {numeric}
	*/
	Numeric.from = function(value) {return toNumeric(value)};

	Numeric.isInteger = function(x) {return isInt(x)};
	Numeric.isFinite = function(x) {return isNumeric(x) && !isInfNan(x)};

	Float.MIN_NORMAL = 2 ** -1022; //docs.oracle.com/javase/8/docs/api/java/lang/Double.html#MIN_NORMAL
	Float.isSafeNumber = function(number)
		{return typeof number == 'number' && abs(number) >= Float.MIN_NORMAL && abs(number) <= Float.MAX_SAFE_INTEGER};

	//"KahanBabushkaKleinSum". Summation with minimal rounding errors
	Math.sum = function(...values)
	{
		let sum = 0, cs = 0, ccs = 0, c = 0, cc = 0;
		/*
		iterators can be replaced by using `ITERABLE.prototype[Symbol.iterator]`
		where "ITERABLE" can be an array, string, or any other object (it also allows adding an iterator)
		so `for ... of` loops must be avoided (this is a to-do)
		*/
		for (let v of values)
		{
			v = +v; let t = sum + v;
			c = abs(sum) >= abs(v) ? (sum - t) + v : (v - t) + sum;
			sum = t; t = cs + c;
			cc = abs(cs) >= abs(c) ? (cs - t) + c : (c - t) + cs;
			cs = t; ccs = ccs + cc
		}
		return sum + cs + ccs
	};

	/**
	@param {bigint} n binary numeral to measure
	@param {bigint} b word size. 1: bit, 8: Byte, 16: word, 32: D-word, 64: Q-word
	@param {numeric} i initial counter. if b = 1 then: 0: lb, 1: length (ignore sign), 2: length (include sign)
	@return {numeric}
	*/
	const sizeOf = (n, b, i) => {n = abs(n); while (n >>= b) i++; return i};

	//ith (degree i) root of x
	const root = (x, i = 2) =>
	{
		if (i == 1) return x;
		if (isIntN(x))
		{
			i = IntN(i);
			if (i == -1n) return 1n / x;
			if (!i) {if (x > 1n) throw new RangeErr('return value is NaN'); return 0n}
			const s = sign(x); x = abs(x);
			if (s == -1 && !(i & 1n)) throw new RangeErr('return value is a Complex number');
			if (i < 0n) {if (!x) throw new RangeErr('return value is Infinity'); return x == 1 ? s : 0n}
			if (!x) return 0n;
			if (x == 1) return s == -1 ? s ** i : x;
			const j = i - 1n;
			//identity: a ^ (1 / k) = b ^ (log_b(a) / k)
			const lb = sizeOf(x, 1n, 0n);
			//using the MSBs instead of generating a power of 2 is a better approximation
			let x0 = x >> (lb - lb / i - 1n), x1 = (x0 * j + x / x0 ** j) / i
			//Heron/Newton/Babylonian Method, thanks to https://stackoverflow.com/a/30869049
			while (x1 < x0) {x0 = x1; x1 = (x1 * j + x / x1 ** j) / i}
			return x0 * s
		}
		else //I hate the complexity of this entire function
		{
			if (isInf(x ** (1 / i))) return x ** (1 / i);
			if (isNan(x) || isNan(i)) return NaN
			if (i == -1) return 1 / x;
			if (!i) return 0
			const s = sign(x); x = abs(x);
			if (s == -1 && !(i % 2)) return NaN;
			if (i < 0n) return x ? (x == 1 ? s : 0) : Infinity;
			if (!x) return x;
			if (x == 1) return s == -1 ? s ** i : x;
			const j = i - 1;
			let x1 = x ** (1 / i);
			if (x1 ** i != x) x1 = (x1 * j + x / x1 ** j) / i;
			return x1 * s
		}
	},
	//I defined this dedicated (instead of just `root(x, 2)`) `sqrt` because of performance and bug concerns
	sqrt = x =>
	{
		if (!isIntN(x)) return x && x ** 0.5; //preserve `-0`
		if (x < 2n) {if (x < 0n) throw new RangeErr('return value is Complex number'); return x}
		let x0 = x >> (sizeOf(x, 1n, 0n) >> 1n), x1 = (x / x0 + x0) >> 1n;
		while (x1 < x0) {x0 = x1; x1 = (x / x1 + x1) >> 1n}
		return x0
	}, cbrt = x => root(x, 3);

	Math.TAU = Math.PI * 2; //no precision loss, because multiplier is power of two

	Math.SQRT5 = sqrt(5); Math.PHI = Math.SQRT5 / 2 + 0.5; //Golden Ratio

	//in general, lb has better precision and performance than ln
	const logB = (function(log) {return function(x, b = Math.E) {return log(x) / log(b)}})(Math.log2);
	/**
	@param {number} x get exponent of this
	@param {number} [y=Math.E] base of logarithm
	@return {number}
	*/
	Math.logB = function(x, y = Math.E) {return logB(+x, +y)};

	Math.LOG2PHI = Math.log2(Math.PHI); Math.LNPHI = Math.log(Math.PHI); Math.LOG10PHI = Math.log10(Math.PHI);

	Math.logPHI = function(x) {return logB(+x, Math.PHI)};

	Math.LOGPHI2 = Math.logPHI(2); Math.LOGPHIE = Math.logPHI(Math.E); Math.LOGPHI10 = Math.logPHI(10);

	Math.SQRT3 = sqrt(3);
	Math.LN3 = Math.log(3); Math.LOG2_3 = Math.log2(3);
	Math.LOG10_3 = Math.log10(3); Math.LOGPHI3 = Math.logPHI(3);
	//ternary lives also matter
	Math.log3 = function(x) {return logB(+x, 3)};
	//stop discriminating the number 3
	Math.LOG3_2 = Math.log3(2); Math.LOG3E = Math.log3(Math.E);
	Math.LOG3_10 = Math.log3(10); Math.LOG3PHI = Math.log3(Math.PHI);
	//join The Order of The Triangle Of Power: https://youtu.be/sULa9Lc4pck

	//Scientific Notation in base B
	defProp(Float.prototype, 'toScientific', function toScientific(b = 10)
		{
			let x = this?.valueOf();
			//JIC someone uses the `call` method
			if (!isFloat(x)) throw new TypeErr("Number.prototype.toScientific requires that 'this' be a Number");
			x = Float(x); b = Float(b); let e;
			if (!isInfNan(x)) {e = x && trunc(logB(abs(x), b)); x = x / b ** e}
			else {e = x; x = sign(x)}
			return x.toString(b) + ' * ' + '10' + '^' + e.toString(b) + ` (base 0d${b})`
		}, 0b101)

	const Mersenne = n => ~(-1n << n), MAX64 = Mersenne(0x40n);
	IntN.MAX_UINT64 = MAX64; IntN.MAX_INT64 = MAX64 >> 1n; IntN.MIN_INT64 = -1n << 63n;
	IntN.MAX_MP_EXP = 82_589_933n; /*Largest known Mersenne Prime exponent
	Yes, the unpacked numeral fits in memory. It's just ~10MB, but ~30MB as decimal string.
	To "unpack" it use: `Mersenne(IntN.MAX_MP_EXP)`
	*/

	//github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.signbit.js
	Float.signbit = function(number)
		{return typeof number == 'number' && !isNan(number) && number < 0 || isNegZero(number)};

	IntN.sign = function(n) {return sign(toIntN(n))}; IntN.abs = function(n) {return abs(toIntN(n))};
	Numeric.sign = function(x) {return sign(toNumeric(x))}; Numeric.abs = function(x) {return abs(toNumeric(x))};

	//should these really return 0 when `y == 0`?
	Math.copySign = function(x, y) {return +x * sign(+y)};
	IntN.copySign = function(x, y) {return toIntN(x) * sign(toIntN(y))};
	Numeric.copySign = function(x, y) {x = toNumeric(x); return x * autoN(sign(toNumeric(y)), x)};

	const minmax = (arr, op, f) =>
	{
		let i = 0, v = f(arr[i]), m = v;
		while (++i < arr.length) {v = f(arr[i]); if (op ? v > m : v < m) m = v}
		return m
	};
	IntN.max = function(...values) {return minmax(values, true, toIntN)};
	IntN.min = function(...values) {return minmax(values, false, toIntN)};

	Numeric.max = function(...values) {return minmax(values, true, toNumeric)};
	//TO-DO: return Number type only if it's safe, otherwise BigInt type.
	//Only do that if there's multiple valid choices
	Numeric.min = function(...values) {return minmax(values, false, toNumeric)};

	const clamp = (x, min, max) =>
	{
		if (min > max) [min, max] = [max, min];
		return x > max ? max : x < min ? min : x
	};
	Math.clamp = function(x, min, max) {return clamp(+x, +min, +max)};
	IntN.clamp = function(x, min, max) {return clamp(toIntN(x), IntN(min), IntN(max))};

	//if the args are not coerced to the same type, the output isn't guaranteed to be the same type as `x`
	Numeric.clamp = function(x, min, max) {return clamp(toNumeric(x), toNumeric(min), toNumeric(max))};

	//https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/math-scale.js
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
		x = +x | 0;
		x = ((x & 0xffff0000) >>> 16) | ((x & 0x0000ffff) << 16);
		x = ((x & 0xff00ff00) >>>  8) | ((x & 0x00ff00ff) <<  8);
		x = ((x & 0xf0f0f0f0) >>>  4) | ((x & 0x0f0f0f0f) <<  4);
		x = ((x & 0xcccccccc) >>>  2) | ((x & 0x33333333) <<  2);
		x = ((x & 0xaaaaaaaa) >>>  1) | ((x & 0x55555555) <<  1);
		return x >>> 0 //toUint32
	};

	//circular left shift
	Math.rotl32 = function(n, b)
	{
		n = +n; b = +b & 31; //coerce and throw the same error as built-ins, then apply mod 32
		n = (n << b) | (n >>> (32 - b));
		return n >>> 0
	};
	//circular right shift
	Math.rotr32 = function(n, b) {n = +n; b = +b & 31; return ((n >>> b) | (n << (32 - b))) >>> 0};

	//is the size of 0 really 1?
	IntN.sizeOf = function(n, b = 8)
	{
		if (b = abs(IntN(b))) return sizeOf(abs(toIntN(n)), b, 1n);
		throw new TypeErr('Invalid measurement unit')
	};

	//lb(bigint)
	IntN.log2 = function(n)
		{if ((n = toIntN(n)) > 0n) return sizeOf(n, 1n, 0n); throw new RangeErr('Non-positive logarithmation')};

	//3 is the closest integer to `Math.E`
	IntN.logB = function(n, b = 3n)
	{
		n = toIntN(n); b = IntN(b);
		if (n < 1n || b < 2n) throw new RangeErr('return value is -Infinity or NaN');
		let i = 0n; while (n /= b) i++;
		return i
	};

	Numeric.logB = function(x, b = 2)
	{
		x = toNumeric(x); b = toNumeric(b);
		if (isNan(x) || isNan(b) || x < 0 || b <= 1) return NaN;
		if (x == 0) return -Infinity;
		if (x == 1) return 0;
		return (isIntN(x) && isIntN(b) ? IntN : Math).logB(x, b)
	};

	Math.root = function(x, y = 2) {return root(+x, +y)};
	IntN.root = function(n, i = 2n) {return root(toIntN(n), toIntN(i))};
	Numeric.root = function(x, n)
	{
		x = toNumeric(x); n = toNumeric(n);
		if (isNan(x) || isNan(n)) return NaN;
		const a = abs(x), ZERO = autoN(0, x); //x^x
		if (!n) return a > 1 ? NaN : ZERO;
		if (x < 0 && (isIntN(n) && !(n & 1n))) return NaN;
		if (n < 0) return a ? (a == 1 ? sign(x) : ZERO) : Infinity;
		if (!a) return ZERO;
		return (isIntN(x) && isIntN(n) ? IntN : Math).root(x, n)
	};
	IntN.sqrt = function(n) {return sqrt(toIntN(n))};
	Numeric.sqrt = function(x) {return (x = toNumeric(x)) < 0 ? NaN : sqrt(x)};

	const random01 = Math.random;
	assert(isInt(random01() * 2 ** 52), 'expected 52 random bits, but got 53')
	/*
	get random safe integer (with random sign).
	only 52bits are generated by `Math.random`,
	so "rand() << 53" must be used to allocate space for the missing bit.
	*/
	Math.randomSafe = function()
	{
		const b = random01() * 4 | 0; //instead of calling thrice, we call it only twice
		return random01() * (b & 2 ? -2 : 2) ** 53 + (b & 1)
	};

	//interval [0, n), or (n, 0] if negative. By default, it returns an uInt64
	IntN.random = function(n = 1n << 0x40n)
	{
		n = toIntN(n);
		const n_len = sizeOf(n, 1n, 1n), s = n < 0n; if (s) n = -n; //abs
		if (n < 2n) {if (n) {return 0n} else throw new RangeErr('requested an int equal and NOT equal to zero')}
		let x, x_len, max;
		do {
			//in this context, the size of 0 is defined as zero instead of 1
			x = x_len = 0n;
			do {
				//build the bigint in 52b blocks, to discard less rand data
				x <<= 52n; x_len += 52n;
				/*
				"`crypto.getRandomValues` is overkill" I was mistaken:
				Repeatedly calling the RNG causes each 52b block in the bigint to be correlated to its neighbors.
				One solution is to call RNG at random locations within the bigint, XORing it with whatever bits are there.
				But that would increase the number of times RNG gets called, potentially exhausting the internal state,
				and therefore repeating the period for the entire browser window,
				unless the engine notices and re-seeds the state.
				It seems the easiest solution is the slowest, calling `getRandomValues`.
				On the plus side, it would make this function crypto-secure,
				which would render redundant any dedicated method (something like `BigInt.cryptoRandom`).
				*/
				x |= IntN(random01() * 2 ** 52)
			} while (x_len <= n_len)
			//this condition and the `-1` allow `%` to never be no-op
			const len_d = x_len - n_len - 1n;
			x >>= len_d; x_len -= len_d;
			max = Mersenne(x_len);
			//https://stackoverflow.com/a/10984975
		} while (x >= max - max % n)
		x %= n; return s ? -x : x
	};

	//Euclidean division
	Math.divEuclid = function(x, y) {return floor(+x / abs(+y)) * sign(+y)};
	//the other variants of int-div are too short

	/**
	All the integer division defnitions
	@param {bigint} n numerator | dividend
	@param {bigint} d denominator | divisor
	@param {string} F function or variant
	@return {bigint} quotient
	*/
	IntN.div = function(n, d, F)
	{
		n = toIntN(n); d = toIntN(d);
		const q = n / d;
		//this could be wrong when using "euclid"
		if ( !(n % d) ) return q;
		const s = (n < 0n) != (d < 0n) ? 1n : 0n; //XOR of sign bits
		switch (Str(F).trim().toLowerCase())
		{
			case 'floor': default: return q - s
			case 'ceil': return q + (s ^ 1n)
			case 'round': return ((s ? -d : d) / 2n + n) / d
			case 'euclid': return (n / abs(d) - s) * sign(d)
			case 'trunc': return q
			case 'roundInf': return q + (s ? -1 : 1)
		}
	};

	//Standard Mathematical Modulo (floor). NOT remainder
	//if args are floats, it can have precision errors, similarly to the naive divison-based definition
	const mod = (n, d) => (n % d + d) % d;
	//TO-DO: localize a multi-mod function.
	//TO-DO: maybe do not use "multi-mod", make each one independent,
	//floor and euclid are the most used

	//en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition
	Math.mod = function(n, d, F)
	{
		n = +n; d = +d;
		//TO-DO: fix mod(x, Infinity) == NaN
		F = Str(F).trim().toLowerCase();
		if (F == 'euclid') d = abs(d);
		//fallback to 'floor' if 'F' is "euclid" or just invalid
		if (!['floor', 'trunc', 'ceil', 'round', 'roundInf'].includes(F)) F = 'floor';
		return n - d * Macro[F](q);
	};

	IntN.mod = function(n, d, F)
	{
		n = toIntN(n); d = toIntN(d);
		F = Str(F).trim().toLowerCase();
		if (F == 'euclid') d = abs(d);
		if (!['floor', 'trunc', 'ceil', 'round', 'roundInf'].includes(F)) F = 'floor';
		return n - d * IntN.div(n, d, F);
	};

	Numeric.mod = function(n, d, F)
	{
		n = toNumeric(n); d = toNumeric(d);
		return (isIntN(n) && isIntN(d) ? IntN : Math).mod(n, d, F)
	};

	Math.modPow = function(b, e, m, F)
	{
		if (isNan(b = +b) || isNan(e = +e) || isNan(m = +m)) return NaN;
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

	IntN.modPow = function(b, e, m, F)
	{
		const mod = IntN.mod;
		b = toIntN(b); e = toIntN(e); m = toIntN(m);
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
	{
		const b = IntN.asIntN(0x40, IntN.random()), e = IntN.random(1n << 8n), m = IntN.asIntN(0x40, IntN.random()),
			F = ['euclid', 'floor', 'trunc', 'ceil', 'round', 'roundInf'][trunc(random01() * 6)];
		assert(IntN.modPow(b, e, m, F) == IntN.mod(b ** e, m, F), 'wrong modular exponentiation')
	}

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

	const sine = Math.sin;
	/**
	*bouncing sine waveform (periodic parabola)
	*@param {number} x
	*@return {number}
	*/
	Math.sinAbs = function(x) {return abs(sine((+x + Math.PI / 3) / 2)) * 2 - 1};

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
		const B = isIntN(n), ONE = B ? 1n : 1;
		let c = ONE ^ ONE; //autoN(0, n)
		while ( !(n & ONE) ) {c += ONE; n = B ? n >> 1n : n >>> 1}
		return c
	};
	//logarithmic binary search is faster than linear, but the engine will do it for us
	Math.ctz32 = function(x) {return ctz(+x >>> 0)};

	IntN.ctz = function(n) {if (n = toIntN(n)) return ctz(n); throw new RangeErr('return value is Infinity')};

	Numeric.ctz = function(n)
	{
		if (isIntN(n = toNumeric(n))) return n ? ctz(n) : Infinity;
		n = trunc(abs(+n));
		if (isInfNan(n)) return NaN;
		if (!n) return 0x400; //(rounded) `Math.log2(Number.MAX_VALUE)` = (truncated) ilb(2 ^ 1024 - 1) + 1
		if (n % 2) return 0;
		n = castFloatToIntN(n);
		const e = ((n >> 52n) & 0x3ffn) - 51n; //get exponent
		n &= Mersenne(52n); //mask mantissa
		n = n ? ctz(n) : 52n;
		return Float(e + n)
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

	//1 is odd, so it's not a power of 2. It's a trivial power, because 1 is a power of any real number
	const isPow2 = x => x > 1 && !(x & (x - 1n));
	IntN.isPow2 = function(n) {return isIntN(n) && isPow2(n)};
	IntN.isMersenne = function(n) {return isIntN(n) && n > 0n && !(n & (n + 1n))};
	Math.isPow2 = function(n) {return isInt(n = +n) && isPow2(IntN(n))};
	//every unsafe int has trailing zeros
	Math.isMersenne = function(n) {return isInt(n = +n) && n < 2 ** 53 && IntN.isMersenne(IntN(n))};

	//for educational purposes see: en.wikipedia.org/wiki/Hamming_weight#Efficient_implementation
	//without optimization, it would be very slow
	const popcnt = x =>
	{
		const B = isIntN(x);
		let c = B ? 0n : 0;
		while (x) {c += x & (B ? 1n : 1); x = B ? x >> 1n : x >>> 1}
		return c
	};
	Math.popcnt32 = function(x) {return popcnt(+x >>> 0)};
	IntN.popcnt = function(n)
	{
		if ((n = toIntN(n)) >= 0n) return popcnt(n)
		throw new RangeErr('return value is Infinity')
	};
	Numeric.popcnt = function(n)
	{
		if (isIntN(n = toNumeric(n))) return n < 0n ? Infinity : popcnt(n);
		if (isInfNan(n)) return NaN;
		n = abs(trunc(+n));
		//mantissa popcount, because exponent doesn't matter
		return Float(popcnt(castFloatToIntN(n) & Mersenne(52n)) + 1n)
	};

	//bitwise (logical base 2, not artihmetic) carryless multiplication
	Math.clmul32 = function(x, y)
	{
		x = +x >>> 0; y = +y >>> 0;
		let prod = 0;
		while (y) {prod ^= (y & 1) && x; y >>>= 1; x <<= 1}
		return prod >>> 0
	};
	//IDK if the naive definition is fast
	IntN.clmul = function(a, b)
	{
		a = toIntN(a); b = toIntN(b);
		//can it be defined?
		if (a < 0n || b < 0n) throw new RangeErr('negative carryless product is undefined');
		let out = 0n;
		while (b) {out ^= (b & 1n) && a; b >>= 1n; a <<= 1n}
		return out
	};

	Numeric.clmul = function(a, b)
	{
		a = toNumeric(a); b = toNumeric(b);
		if (a < 0 || b < 0 || isInfNan(a) || isInfNan(b)) return NaN;
		a = IntN(trunc(a)); b = IntN(trunc(b));
		return IntN.clmul(a, b)
	};

	Math.isSquare = function(n)
	{
		if (!isInt(n = +n)) return false
		if (n < 2) return n >= 0
		const c = Numeric.ctz(n);
		if (c % 2) return false;
		n /= 2 ** c;
		return n % 8 == 1 && isInt(sqrt(n))
	};

	IntN.isSquare = function(n)
	{
		if (!isIntN(n)) return false
		if (n < 2n) return n >= 0n
		const c = ctz(n);
		if (c & 1n) return false;
		n >>= c;
		return n & 7n == 1n && sqrt(n) ** 2n == n
	};

	Numeric.isSquare = function(n) {return isInt(n) && (isIntN(n) ? IntN : Math).isSquare(n)};

	Math.isCube = function(n)
	{
		if (!isInt(n = abs(+n))) return false
		if (n < 2) return true;
		const ctz = Numeric.ctz(n); if (ctz % 3) return false;
		n /= 2 ** ctz;
		//math.stackexchange.com/a/2190888
		let m = abs(n % 9); if (m > 1 && m != 8) return false
			m = abs(n % 7); if (m > 1 && m != 6) return false
		return isInt(cbrt(n))
	};
	//assert(Math.isCube((random01() * 2 ** 17) ** 3), '`Math.isCube` is bugged')
	//currently, this throws

	IntN.isCube = function(n)
	{
		if (!isIntN(n)) return false; if (!n) return true
		const c = ctz(n); if (c % 3n) return false
		//the engine will probably reuse the shifted local copy of `n` inside `ctz`
		n >>= c;
		/*
		`abs` is O(n) in worst-case only, so we must use it sparingly.
		Inverting the math sign of an odd number doesn't need sum, just (~n | 1n).
		But we can reduce those 2 ops to 1. XORing with minus-two flips all bits except LSB,
		like this: `if (n < 0n) n ^= -2n`
		bitwise ops are parallelizable, increasing potential speed.
		However, this micro-algorithm is deprecated because computing the `abs` of a remainder < 9 is faster
		*/
		let m = abs(n % 9n); if (m > 1n && m != 8n) return false
			m = abs(n % 7n); if (m > 1n && m != 6n) return false
		return cbrt(n) ** 3n == n
	};
	//assert(BigInt.isCube(BigInt.random() ** 3n), '`BigInt.isCube` is bugged')
	//it seems `cbrt` has problems

	Numeric.isCube = function(n) {return isInt(n) && (isIntN(n) ? IntN : Math).isCube(n)};

	//TO-DO: call in GCD and `factorize`
	const toFraction = x =>
	{
		assert(isFloat(x), 'expected float but got ' + x)
		if (isInt(x) || isNan(x)) return [x, 1];
		const s = x < 0; if (s) x = -x; //abs
		if (x == Infinity) return [s ? -1 : 1, 0];
		const n = trunc(x); x -= n;
		for (let f0 = [0, 1], f1 = [1, 1];;)
		{
			const fm = [f0[0] + f1[0], f0[1] + f1[1]], mid = fm[0] / fm[1];
			//TO-DO: compare new `mid` with old `mid`, to avoid infinite loops
			//fractions like `28 / 3` cause it to never halt
			if (mid == x) {fm[0] += n * fm[1]; if (s) fm[0] *= -1; return fm}
			else if (mid < x) {f0 = fm} else f1 = fm
		}
	};

	/**
	*Euclidean algorithm for finding Highest Common Factor.
	*returns correct values when inputs are rational numbers
	*whose denominators are any power of 2 (including 2**0)
	*@param {numeric} a
	*@param {numeric} b
	*@return {numeric}
	*/
	const Euclid = (a, b) => {while (b) [a, b] = [b, a % b]; return a};

	Math.gcd = function(x, y)
	{
		x = abs(+x); y = abs(+y);
		if (isNan(x) || isNan(y)) return NaN
		if (!isInt(x) || !isInt(y)) return Euclid(x, y)
		//borrowed from Stein, lol
		const i = Numeric.ctz(x), j = Numeric.ctz(y),
			k = i < j ? i : j; //min
		//ensure the max length is 53b
		x /= 2 ** i; y /= 2 ** j;
		return (Math.isMersenne(x) && Math.isMersenne(y)
			? 2 ** Math.gcd(trunc(Math.log2(x)) + 1, trunc(Math.log2(y)) + 1) - 1
			: Euclid(x, y)) * 2 ** k
	};

	//BEHOLD THE ULTIMATE GCD ALGORITHM (ok maybe I exaggerated)
	IntN.gcd = function(a, b)
	{
		//simplify future operations
		a = abs(toIntN(a)); b = abs(toIntN(b));
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
		Example: GCD(0b111_111, 0b1111_1111) = 0b11
		because GCD(6, 8) = 2.
		In case you didn't know,
		`bigMersenne - smallMersenne == bigMersenne ^ smallMersenne`.
		I did some research and apparently it works for ANY base, not just 2:
		math.stackexchange.com/a/11570
		*/
		if (IntN.isMersenne(a) && IntN.isMersenne(b)) return Mersenne(IntN.gcd(sizeOf(a, 1n, 1n), sizeOf(b, 1n, 1n))) << k;

		//set base ("Beta") of Lehmer's algo to `2 ** (2 ** BIN)`
		const BIN = 8n;

		if (b > a) [a, b] = [b, a];
		const a_len = sizeOf(a, 1n << BIN, 1n), b_len = sizeOf(b, 1n << BIN, 1n);
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
	};

	Numeric.gcd = function(a, b)
	{
		a = abs(toNumeric(a)); b = abs(toNumeric(b));
		return isIntN(a) && isIntN(b) ? IntN.gcd(a, b) : Math.gcd(a, b)
	};
	//should `abs` be a tail-call in all of these (GCDs and LCMs)? it seems better to use it at the start
	Math.lcm = function(x, y)
	{
		x = abs(+x); y = abs(+y);
		return x / Math.gcd(x, y) * y
		//lower overflow probability than `a * b / Math.gcd(a, b)`
	};

	IntN.lcm = function(a, b)
	{
		a = abs(toIntN(a)); b = abs(toIntN(b));
		return a / IntN.gcd(a, b) * b
		//better performance than `a * b / BigInt.gcd(a, b)`
	};

	Numeric.lcm = function(a, b)
		{a = abs(toNumeric(a)); b = abs(toNumeric(b)); return a / Numeric.gcd(a, b) * b};

	//2nd lowest common divisor
	//the 1st is always 1
	Numeric.lcd = function(a, b)
	{
		a = abs(toNumeric(a)); b = abs(toNumeric(b));
		const rt = sqrt(a * b), ONE = autoN(1, a);
		for (let i = autoN(2, ONE); i <= rt; i++) if (!(a % i || b % i)) return i;
		return ONE
	};

	//Arithmetic-Geometric Mean. This is just an approximation, because of rounding errors
	Math.agm = function(x, y)
	{
		if ((x = +x) == (y = +y)) return x //avoid round-errors and increase efficiency
		let a;
		do [x, y, a] = [(x + y) / 2, sqrt(x * y), x]
		while (x != a && x == x) /*
		the 1st condition "squeezes" all the precision.
		the 2nd prevents EVERY possible infinite loop (the 1st also helps).
		100% halt guarantee. If it doesn't halt, you get a refund lol
		*/
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
		const m = sqrt(x), out = []; let i;
		for (i = 3; i <= m; i += 2) if ( !(x % i) ) out[out.length] = i;
		i = out.length - Math.isSquare(x) - 1;
		while (i >= 0) out[out.length] = x / out[i--];
		const bin = []; //unique powers of 2
		for (i = 1; i <= c; i++) bin[bin.length] = 2 ** i;
		//TO-DO: add and fix missing multiplication and insertion
		return out
	};

	//array of sorted Primes, no gaps (dense)
	const Pa = [3, 5], //2 is unnecessary because CTZ
	//Primality "dictionary", any order, gaps allowed (sparse)
		Pd = new Set([2, 3, 5]),
	//find next prime and store it
		addP = function()
		{
			let x = Pa[Pa.length - 1] + 2;
			loop: for (;; x += 2)
			{
				if (Pd.has(x)) break;
				if (Math.isSquare(x)) continue;
				let j = 0;
				//`sqrt` will never return a different value each call
				//so the engine will call it once then store the result in a "ghost var"
				while (Pa[j] <= sqrt(x)) if (x % Pa[j++] == 0) continue loop;
				Pd.add(x); break;
			}
			Pa[Pa.length] = x
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

	const exp = Math.exp,
		//factorial approximations for non-ints.
		//These 3 are trash, none make use of full precision. I need help to make these more accurate
		Gosper = x => sqrt((+x + 1 / 6) * Math.TAU) * (x / Math.E) ** x, //improvement of Stirling
		//Gamma Function (+1) defined as Summation instead of Integration
		Gamma = x => {let t = 1, s0, s1 = 0 ** x; do {s0 = s1; s1 += t ** x * exp(-t); t++} while (s0 != s1); return s0},
		//https://en.wikipedia.org/wiki/Lanczos_approximation#Simple_implementation
		Lanczos = z =>
		{
			const p = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
				12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
			if (z < 0.5) return Math.PI / (sine(Math.PI * z) * Lanczos(1 - z))
			else
			{
				z--; let x = 0.99999999999980993;
				for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1);
				const t = z - 0.5 + p.length;
				return sqrt(Math.TAU) * t ** (z + 0.5) * exp(-t) * x
			}
		};
	Math.factorial = function(x)
	{
		if ((x = +x) >= 171) return Infinity
		if (x < 0 || isNan(x)) return NaN
		/*
		We could precompute an int lookup table, and use spline interpolation for faster processing.
		The problem is that if `x` is at the extreme, the output would be `NaN` unless we use extrapolation
		*/
		if ( !isInt(x) ) return [Gosper, Gamma, Lanczos][2](x)
		let out = 1;
		for (let i = 2; i <= x; i++) out *= i;
		return out
	};

	//https://en.wikipedia.org/wiki/Factorial#Properties
	IntN.factorial = function(n)
	{
		if ((n = toIntN(n)) < 0n) throw new RangeErr('return value is NaN')
		let out = 1n;
		for (let i = 3n; i <= n; i++) out *= i >> ctz(i); //reduce size
		//https://en.wikipedia.org/wiki/Legendre%27s_formula#Alternate_form
		return out << (n - popcnt(n)) //recover TZ
		/*
		my algorithm isn't good for BigInts, these are better:
		http://www.luschny.de/math/factorial/FastFactorialFunctions.htm
		https://github.com/PeterLuschny/Fast-Factorial-Functions
		https://web.archive.org/web/20050211005140/http://www.luschny.de/math/factorial/Description.htm
		*/
	};
	//TO-DO: add rising and falling Fs
	Numeric.factorial = function(x, k = 1)
	{//if k > 1 returns multifactorial of that degree
		let s; [s, x] = signabs(toNumeric(x));
		k = trunc(toNumeric(k)) * s; //TODO: fix error when not same-type
		let out = autoN(1, x);
		for (let i = k, len = 1n; len <= x; i += k) {out *= i; len++; if (isInfNan(out)) return out};
		return out
	};

	//iterative inverse int Fact
	//if this got the inverse Gamma function, it would be more accurate
	Numeric.factorial_inv = function(n, k = 1)
	{//if k > 1 returns corresponding inv multifactorial
		if ( !(n = toNumeric(n)) || isNan(k = toNumeric(k)) ) return NaN
		if (isInfNan(n)) return n;
		let out = sign(n);
		if (!k) return out
		while (abs(n) > 1) {n /= out; out += k}
		return out
	};


	//"Termial/Additorial/Sumatorial" Fs
	//en.wikipedia.org/wiki/Triangular_number ; en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF

	//get Nth "TriNumber" fast
	Numeric.triNum = function(x)
	{
		const ONE = autoN(1, x = toNumeric(x)), TWO = autoN(2, ONE);
		//lower overflow probability
		return x % TWO ? (x + ONE) / TWO * x : x / TWO * (x + ONE)
	};

	//get index of a trinum
	Numeric.triNum_inv = function(x)
		{return isIntN(x = toNumeric(x)) ? (sqrt((x << 3n) | 1n) - 1n) >> 1n : (sqrt(8 * x + 1) - 1) / 2};

	//get TriNums up to index x (inclusive)
	Numeric.triSeq = function(x)
	{
		let s; [s, x] = signabs(toNumeric(x));
		const out = [x ^ x]; //auto-type Zero
		for (let i = s; out.length <= x; i += s) out[out.length] = i + out[out.length - 1];
		return out
	};

	//get Nth Fibonacci faster than recursion
	Math.Fib = function(x)
	{
		let s; [s, x] = signabs(+x);
		return round(Math.PHI ** x / Math.SQRT5) * (s == -1 && x % 2 == 0 ? -1 : 1)
	};
	//en.wikipedia.org/wiki/Generalizations_of_Fibonacci_numbers#Extension_to_negative_integers

	//get index of a Fib num `x`
	Math.Fib_inv = function(x)
	{
		let s; [s, x] = signabs(+x);
		const i = floor(logB(x * Math.SQRT5 + 0.5, Math.PHI))
		return !(i % 2) && s == -1 ? NaN : i * s
	};

	//en.wikipedia.org/wiki/Lucas_sequence
	//co-recursive Lucas function
	//If F is falsy (default) then "U", else "V"
	Numeric.Lucas = function(n, P = 1, Q = -1, F)
	{
		n = Float(n) >>> 0; P = toNumeric(P); Q = toNumeric(Q);
		//this XOR is used to throw early when values are not same-type
		const ZERO = autoN(0, P ^ Q), ONE = autoN(1, ZERO),
			L = F ? [autoN(2, ONE), P] : [ZERO, ONE];
		while (L.length <= n) L[L.length] = P * L[L.length - 1] - Q * L[L.length - 2];
		return L
	};

	//TO-DO: maybe insert Dot-Product here

	//correction of data descriptors, to make everything equal to vanilla JS
	for (const O of [Float, Math, IntN, Numeric])
	{
		//`for in` is slower and has more potential side-effects
		for (const k of Object.keys(O))
		{
			defProp(O, k, O[k], +(typeof O[k] == 'function') && 0b101)
			if (typeof O[k] == 'function') defProp(O[k], 'name', O[k].name || k, 1)
		}
	}
})()
