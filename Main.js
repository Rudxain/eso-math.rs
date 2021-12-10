'use strict';

{
   const F = Object.defineProperty;

   F(globalThis, 'defProp',
      {
         value:
         /**
         *@param {object} O Object to modify
         *@param {string} k key (property name) to define
         *@param {*} v value to set
         *@param {(boolean[]|numeric|string)} a descriptor
         */
         function defProp(O, k, v, a)
         {
            switch (typeof(a = a.valueOf()))
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
                  a = [/w/i.test(a), /e/i.test(a), /c/i.test(a)];
                  break;
            }
            return F(O, k, {value: v, writable: !!a[0], enumerable: !!a[1], configurable: !!a[2]})
         },
         writable: false, enumerable: false, configurable: false
      }
   )
}

//for environments that aren't Deno
globalThis.AssertionError = class AssertionError extends Error
{
   constructor(m)
   {
      super(m);
      defProp(this.__proto__, 'name', this.constructor.name, 0b101)
   }
};
defProp(globalThis, 'AssertionError', AssertionError, 0b101)


defProp(globalThis, 'assert', function assert(c, m) {if (!c) throw new AssertionError(m)}, 0)

{
   //github.com/tc39/proposal-relative-indexing-method#polyfill
   function at(n)
   {
      let l = this.length;
      //BigInt (and object-wrapped bigint) support
      if (BigInt.is(n))
         l = BigInt(l)
      else
         n = Math.trunc(n) || 0;
      if (n < 0) n += l;
      return n < 0 || n >= l ? undefined : this[n]
   }
   for (const C of [Array, String, Reflect.getPrototypeOf(Int8Array)])
      defProp(C.prototype, 'at', at, 0b101);
}

/**the main numeric object
*the name is inspired by Ecmascript's `toNumeric` abstract function
*@var {object} Numeric
*/
defProp(globalThis, 'Numeric', {}, 0b101)
//this is intended to work with any numerical value

/**
*any strictly numerical value
*@typedef {(number|bigint)} numeric
*/


/**
*get the internal bits (IEEE 754 representation)
*@param {number} x
*@return {bigint}
*/
Number.toRaw = function float2raw(x)
   {return new BigUint64Array(new Float64Array([x]).buffer)[0]};
//missing hex support in both methods

/**
*get value of a BigInt when read as IEEE 754
*@param {bigint} x
*@return {number}
*/
Number.fromRaw = function raw2float(x)
   {return new Float64Array(new BigUint64Array([x]).buffer)[0]};

/**
*check signed/negative zero
*@param {number} x
*@return {boolean}
*/
Number.isMinusZero = function(x) {return x === 0 && 1 / x < 0};

/**
*strictly check if number
*@param {*} x
*@return {boolean}
*/
Number.is = function isNumber(x) {return typeof x.valueOf() == 'number'};

/**
*check if primitive BigInt or
*object-wrapped bigint
*@param {*} x
*@return {boolean}
*/
BigInt.is = function isBigInt(x) {return typeof x.valueOf() == 'bigint'};
//IDK if this is the same as `typeof x == 'bigint' || x instanceof BigInt`

/**
*https://tc39.es/ecma262/multipage/abstract-operations.html#sec-tobigint
*@param {(boolean|string|bigint)} x
*@return {bigint}
*/
BigInt.to = function toBigInt(x)
{
   if (['string', 'boolean', 'bigint'].includes(typeof x.valueOf()))
      return BigInt(x);
   throw new TypeError(`Cannot convert ${x} to BigInt`)
};

/**
*check if any numeric value
*@param {*} x
*@return {boolean}
*/
Numeric.is = function isNumeric(x) {return Number.is(x) || BigInt.is(x)};
/**
*coerce to numeric
*by using the least invasive/intrusive algorithm I know
*@param {*} x
*@return {numeric}
*/
Numeric.to = function toNumeric(x)
{
   x = x.valueOf();
   return Numeric.is(x) ? x :
      isNaN(x) ||
      Math.abs(x) <= Number.MAX_SAFE_INTEGER ||
      //I know /\s/ exists, but `trim` is faster and more readable
      /^[-+]?Infinity$/.test(String(x).trim()) ? +x : BigInt(x)
};

//check if int by coercion
//JS should have this for consistency
defProp(globalThis, 'isInteger',
   function isInt(x) {return BigInt.is(x) || Number.isInteger(+x)},
   0b101
)
/**
*check if strictly any integer
*@param {(number|bigint)}
*@return {boolean}
*/
Numeric.isInt = function(x) {return Number.isInteger(x) || typeof x == 'bigint'};

/**
*`Number.isFinite` must only work with `Number` values,
*but the global version is supposed to work with any value,
*this is why I HAD to replace it
*@param {numeric} x
*@return {boolean}
*/
isFinite = function(x)
   {return BigInt.is(x) || ((x = +x) == x && x != Infinity && x != -Infinity)};


//docs.oracle.com/javase/7/docs/api/java/lang/Double.html#MIN_NORMAL
Number.MIN_NORMAL = Math.pow(2, -1022);


//Scientific Notation in base B
defProp(Number.prototype, 'toScientific',
   function SciNotB(b = 10)
   {
      let x = this, e;
      if (isFinite(x))
      {
         e = x && Math.floor(Math.logB(Math.abs(x), b));
         x = x / b ** e
      }
      else
      {
         e = x;
         x = Math.sign(x)
      }
      return x.toString(b) + ' * ' + '10' + '^' + e.toString(b) + ` (base 0d${b})`
   },
   0b101
)


Math.TAU = Math.PI * 2; //no accuracy loss
//because multiplier is power of two

Math.SQRT5 = Math.sqrt(5);

//Golden Ratio
Math.PHI = Math.SQRT5 / 2 + 0.5;

/**
*@param {number} x get exponent of this
*@param {number} [b=Euler] base of logarithm
*@return {number}
*/
Math.logB = function(x, b = Math.E) {return Math.log2(x) / Math.log2(b)};
//in general, lb has better precision than ln

Math.LOG2PHI = Math.log2(Math.PHI);
Math.LNPHI = Math.log(Math.PHI);
Math.LOG10PHI = Math.log10(Math.PHI);

Math.logPHI = function(x) {return Math.logB(x, Math.PHI)};

Math.LOGPHI2 = Math.logPHI(2);
Math.LOGPHIE = Math.logPHI(Math.E);
Math.LOGPHI10 = Math.logPHI(10);

Math.SQRT3 = Math.sqrt(3);
Math.LN3 = Math.log(3);
Math.LOG2_3 = Math.log2(3);
Math.LOG10_3 = Math.log10(3);
Math.LOGPHI3 = Math.logPHI(3);
//ternary lives also matter
Math.log3 = function(x) {return Math.logB(x, 3)};
//stop discriminating the number 3
Math.LOG3_2 = Math.log3(2);
Math.LOG3E = Math.log3(Math.E);
Math.LOG3_10 = Math.log3(10);
Math.LOG3PHI = Math.log3(Math.PHI);

//Maximum unsigned 64bit value
BigInt.U64MAX = ~(-1n << 0x40n);

//Maximum signed 64bit value
BigInt.S64MAX = BigInt.U64MAX >> 1n;

//Minimum signed 64bit value
BigInt.S64MIN = -1n << 63n;


//github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.signbit.js
Math.signbit = function(x)
//this should be in `Number`, not `Math`
   {return (x = +x) == x && x < 0 || Number.isMinusZero(x)};

//for consistency, no static method will be an arrow function
BigInt.sign = function(n)
{
   n = BigInt.to(n);
   return n && (n < 0n ? -1n : 1n)
};
BigInt.abs = function(n)
{
   n = BigInt.to(n);
   return n < 0n ? -n : n
};

Numeric.sign = function(x)
   {return (BigInt.is(x = Numeric.to(x)) ? BigInt : Math).sign(x)};
Numeric.abs = function(x)
   {return (BigInt.is(x = Numeric.to(x)) ? BigInt : Math).abs(x)};

Numeric.signSplit = function(x)
   {return [Numeric.sign(x), Numeric.abs(x)]}; //should be reversed order

BigInt.max = function(...a)
{
   a = a.map(BigInt.to);
   let i = 0, m = a[i];
   while (++i < a.length)
      {if (a[i] > m) m = a[i];}
   return m
};
BigInt.min = function(...a)
{
   a = a.map(BigInt.to);
   let i = 0, m = a[i];
   while (++i < a.length)
      {if (a[i] < m) m = a[i];}
   return m
};

Numeric.max = function(...a)
{
   a = a.map(Numeric.to);
   let i = 0, m = a[i];
   while (++i < a.length)
      {if (a[i] > m) m = a[i];}
   return m
};
Numeric.min = function(...a)
{
   a = a.map(Numeric.to);
   let i = 0, m = a[i];
   while (++i < a.length)
      {if (a[i] < m) m = a[i];}
   return m
};

Math.clamp = function(x, m0, m1)
{//main input, lower bound, upper bound. respectively
   x = +x; m0 = +m0; m1 = +m1;
   if (m0 > m1) [m0, m1] = [m1, m0];
   //if `m0` is NaN, it'll be interpreted as -Infinity
   //if `m1` is NaN, it'll be interpreted as +Infinity
   return x > m1 ? m1 : x < m0 ? m0 : x
   //this will only return NaN if `x` is NaN
};

BigInt.clamp = function(n, m0, m1)
{
   const {to, max, min} = BigInt;
   n = to(n); m0 = BigInt(m0); m1 = BigInt(m1);
   if (m0 > m1) [m0, m1] = [m1, m0];
   return max(min(n, m1), m0)
};

Numeric.clamp = function(x, m0, m1)
{
   const {to, max, min} = Numeric;
   n = to(n); m0 = to(m0); m1 = to(m1);
   if (m0 > m1) [m0, m1] = [m1, m0];
   return max(min(n, m1), m0)
};

//github.com/zloirock/core-js/blob/master/packages/core-js/internals/math-scale.js
//https://rwaldron.github.io/proposal-math-extensions/#sec-math.scale
Math.scale = function(x, inLow, inHigh, outLow, outHigh)
{
   x = +x; if (!isFinite(x)) return x;
   //throw on BigInt and
   //avoid string concatenation if `outLow` is text
   inLow = +inLow; inHigh = +inHigh;
   outLow = +outLow; outHigh = +outHigh;
   return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow
};

//round towards unsigned (any) Infinity
Math.roundInf = function(x) {return Math[+x < 0 ? 'floor' : 'ceil'](x)};

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
   const I = BigInt; n = I.to(n);
   const b = I.sizeOf(n, 1n),
      neg = n < 0n;
   if (neg) n = -n;
   let l = 1n, x = 0n; //l = size of x
   while (l <= b)
   {
      x <<= 53n;
      l += 53n;
      //getRandomValues is overkill
      x |= I(Math.randomSafe())
   }
   const s = l - b - 1n;
   //remove bias. seems like it doesn't work?
   x >>= s; l -= s;
   const MAX = ~(-1n << l);
   while (x >= MAX - MAX % n)
      x ^= I(Math.randomSafe());
   x %= n;
   return neg ? -x : x
};

//Euclidean division
Math.divEuclid = function(n, d) {return Math.floor(n / Math.abs(d)) * Math.sign(d)};
//the other variants of integer division aren't included,
//because they're too short and simple

/*
positive r: ceil
negative r: floor
neutral r: Euclidean
falsy r: round
*/
BigInt.div = function(n, d, r)
{//n and d are dividend and divisor respectively
   n = BigInt.to(n); d = BigInt.to(d);
   if (!(n % d)) return n / d;
   const s = (n < 0n) != (d < 0n);
   return (
      r ? n / d + (r > 0 ? (s ? 0n : 1n) : (s ? -1n : 0n))
      : (r == 0 ?
         n / BigInt.abs(d) - (n < 0n ? BigInt.sign(d) : 0n)
         : ((s ? -d : d) / 2n + n) / d)
   )
};

{
   //Standard Mathematical modulo. NOT remainder
   const mod = (n, d) => (n % d + d) % d; //is `n - Math.floor(n / d) * d` better?
   //TO-DO: add the other definitions:
   //en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition

   //Math is racist against BigInt, but accepts everyone else
   Math.mod = function(n, d) {return mod(+n, +d)};

   //BigInt hates everything but Booleans and Strings
   BigInt.mod = function(n, d) {return mod(BigInt.to(n), BigInt.to(d))};

   /*
   The `Numeric` family accepts everyone as they are.
   And if they aren't numeric, it helps them find their best fitting form
   such that they are comfortables with themselves.
   */
   Numeric.mod = function(n, d) {return mod(Numeric.to(n), Numeric.to(d))};
   //in a nutshell, you've learned the differences between methods of different objects
}

//converts degrees to radians by default
Math.angleToRad = function(a, scale = 360) {return Math.TAU / scale * a};
//scale = 360: degrees
//scale = 1: Tau radians

//converts radians to degrees by default
Math.radToAngle = function(r, scale = 360) {return r / (Math.TAU / scale)};

//bouncing sine waveform (periodic parabola)
Math.sinAbs = function(x)
   {return Math.abs(Math.sin((x + Math.PI / 3) / 2)) * 2 - 1};

//missing "circular" wave (cycloid)

//trigonometric sawtooth waveform
Math.sawTrig = function(x)
{
   x /= Math.TAU;
   return (x - Math.floor(x + 0.5)) * 2
};

//triangular
Math.triTrig = function(x)
   {return Math.abs(Math.sawTrig(x)) * 2 - 1};

//square wave defined as piecewise
//because Math.sign(Math.sin(x)) is inefficient
Math.sqrTrig = function(x)
{
   x = Math.mod(x, Math.TAU); //normalize to simplify comparisons
   return x && Math.sign(Math.PI - x)
};


Math.ctz32 = function(n) {return n | 0 ? 31 - Math.clz32(n & -n) : 32};
//count trailing zeros in binary
BigInt.ctz = function(n)
{
   n = BigInt.to(n);
   if (!n) throw new RangeError('return value is Infinity');
   //`b` must be a power of 2. use 32 for a D-word CPU
   let i = 0n, b = 0x40n, w = ~(-1n << b);
   //loop unrolling by linear word search
   while (!(n & w)) {i += b; n >>= b}
   //release memory, and
   n &= w; //increase probability of fixed-precision optimization
   //binary search
   while (b >>= 1n) if (!(n & (w >>= b))) {i |= b; n >>= b};
   //I rolled the loop because it'll probably be unrolled anyway.
   //this "rolling" allows changing `b` without editing extra code
   return i
};

Numeric.ctz = function(n)
{
   n = Numeric.to(n);
   if (BigInt.is(n)) return n ? BigInt.ctz(n) : Infinity;
   n = Math.trunc(Math.abs(n));
   if (!isFinite(n)) return NaN;
   if (!n) return 0x400; //(rounded) `Math.log2(Number.MAX_VALUE)` = (truncated) ilb(2 ^ 1024 - 1) + 1
   if (n % 2) return 0;
   n = Number.toRaw(n);
   const e = ((n >> 52n) & 0x3ffn) - 51n; //abs(exponent), unbiased
   n &= ~(-1n << 52n); //mantissa
   n = n ? BigInt.ctz(n) : 52n;
   return Number(e + n)
   /*
   //the following algorithm is ditched
   //because I doubt it's efficient.
   //It's kept here for historical purposes
   const c = Math.trunc(Math.log2(n)) - 52;
   if (c > 0) n /= 2 ** c; //remove all but the most significant 53b
   //floats larger than 53b always have trailing zeros
   //so there's no need for `trunc`
   assert(n % 1 == 0) //just in case
   return (c > 0 && c) +
      Math.ctz32(n) +
      (n | 0 ? 0
         : n >= 2 ** 32 && Math.ctz32(n / 2 ** 32))
   */
};

Numeric.isDivisible = function(n, d)
{
   n = n.valueOf(); d = d.valueOf();
   return typeof n == typeof d && Numeric.isInt(n) && Numeric.isInt(d) && d && !(n % d)
};

BigInt.isPow2 = function(n)
   {return BigInt.is(n) && n > 0n && !(n & (n - 1n))};
//Do these need manual optimization?
BigInt.isMersenne = function(n)
   {return BigInt.is(n) && n > 0n && !(n & (n + 1n))};

Math.isPow2 = function(n)
   {return Number.isInteger(n.valueOf()) && n > 0 && BigInt.isPow2(BigInt(n))};
//Do these need manual optimization?
Math.isMersenne = function(n)
   {return Number.isInteger(n.valueOf()) && n > 0 && BigInt.isMersenne(BigInt(n))};


//reverse the order of bits using "binary chop"
Math.rev32 = function(n)
{
   n  =   ((n & 0xffff0000) >>> 0x10) | ((n & 0x0000ffff) << 16);
   n  =   ((n & 0xff00ff00) >>> 0x08) | ((n & 0x00ff00ff) << 8);
   n  =   ((n & 0xf0f0f0f0) >>> 0x04) | ((n & 0x0f0f0f0f) << 4);
   n  =   ((n & 0xcccccccc) >>> 0x02) | ((n & 0x33333333) << 2);
   return ((n & 0xaaaaaaaa) >>> 0x01) | ((n & 0x55555555) << 1)
   //beautiful alignment
};

//missing rotate left/right

//popcnt32(n) % 2 != 0
Math.parity32 = function(n)
{
   for (let i = 1; i <= 16; i <<= 1) n ^= n >>> i;
   return !!(n & 1)
};

//popcnt(n) & 1n != 0n
BigInt.parity = function(n)
{
   n = BigInt.to(n);
   if (n < 0n) throw new RangeError('return value is NaN');
   let i = 1n;
   while (n >> i) {n ^= n >> i; i <<= 1n}
   return !!(n & 1n)
};

Math.popcnt32 = function(i)
{//stackoverflow.com/a/109025
   i |= 0; //maybe `>>>=` is correct
   i -= (i >>> 1) & 0x55555555;
   i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
   i = (i + (i >>> 4)) & 0x0F0F0F0F;
   return Math.imul(i, 0x01010101) >>> 24;
};

BigInt.popcnt = function(n)
{
   n = BigInt.to(n);
   if (n < 0n) throw new RangeError('return value is Infinity')
   //this algorithm works best with less zeros
   n >>= n && BigInt.ctz(n);
   if (n < 2n) return n;
   let c = 0n, w = new BigUint64Array(1); //correctness and performance
   const m = 0x3333333333333333n;
   do {
      w[0] = n;
      //en.wikipedia.org/wiki/Hamming_weight#Efficient_implementation
      w[0] -= (w[0] >> 1n) & 0x5555555555555555n;
      w[0] = (w[0] & m) + ((w[0] >> 2n) & m);
      w[0] = (w[0] + (w[0] >> 4n)) & 0x0f0f0f0f0f0f0f0fn;
      w[0] *= 0x0101010101010101n;
      //emulate mul overflow (wraparound mod 2^64)
      c += (w[0] >>= 56n);
   } while (n >>= 64n)
   return c
};

Numeric.popcnt = function(n)
{
   n = Numeric.to(n);
   if (BigInt.is(n)) return n < 0n ? Infinity : BigInt.popcnt(n);
   if (!isFinite(n)) return NaN;
   n = Math.abs(Math.trunc(n));
   //mantissa popcount, because exponent doesn't matter
   return Number(BigInt.popcnt(Number.toRaw(n) & ((1n << 52n) - 1n)) + 1n)
};

Math.isSquare = function(n)
{
   n = +n;
   if (!Number.isInteger(n)) return false;
   if (n < 2) return n >= 0;
   const ctz = Numeric.ctz(n);
   if (ctz % 2) return false;
   n /= 2 ** ctz;
   if (n % 8 != 1) return false;
   return Number.isInteger(Math.sqrt(n))
};

BigInt.isSquare = function(n)
{
   if (!BigInt.is(n)) return false;
   if (n < 2n) return n >= 0n;
   const ctz = BigInt.ctz(n);
   if (ctz & 1n) return false;
   n >>= ctz;
   if (n & 7n != 1n) return false;
   return BigInt.sqrt(n) ** 2n == n
};

Numeric.isSquare = function(n)
{
   if (!Numeric.isInt(n)) return false;
   return (BigInt.is(n) ? BigInt : Math).isSquare(n)
};

//math.stackexchange.com/a/2190888
Math.isCube = function(n)
{
   n = Math.abs(n);
   if (!Number.isInteger(n)) return false;
   if (!n) return true;
   const ctz = Numeric.ctz(n);
   if (ctz % 3) return false;
   n /= 2 ** ctz;
   if (n == 1) return true;
   if (!([0, 1, 8].includes(n % 9) && [0, 1, 6].includes(n % 7)))
      return false;
   return Number.isInteger(Math.cbrt(n))
};

BigInt.isCube = function(n)
{
   if (!BigInt.is(n)) return false;
   n = BigInt.abs(n);
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
   if (!Numeric.isInt(n)) return false;
   return (BigInt.is(n) ? BigInt : Math).isCube(n)
};

//this should be an instance method
BigInt.sizeOf = function(n, b = 8)
{//b is the unit of measurement. 1: bit, 8: Byte, 16: word, 32: D-word, 64: Q-word
   n = BigInt.abs(n); b = BigInt.abs(BigInt(b)); //exclude sign bit
   //what's the size of 0? 0 or 1?
   let i = 1n;
   while (n >>= b) i++;
   return i
};

BigInt.log2 = function(n) //lb(bigint)
{
   n = BigInt.to(n);
   if (n <= 0n) throw new RangeError('Non-positive logarithmation');
   //linear Q-word search (optimized for 64bit CPUs)
   let i = (BigInt.sizeOf(n, 64n) - 1n) << 6n;
   n >>= i; //remove all BUT the most significant Q-word
   //binary search
   if (n & 0xFFFFFFFF00000000n) {i |= 32n; n >>= 32n}
   if (n & 0xFFFF0000n) {i |= 16n; n >>= 16n}
   if (n & 0xFF00n) {i |= 8n; n >>= 8n}
   if (n & 0xF0n) {i |= 4n; n >>= 4n}
   if (n & 0xCn) {i |= 2n; n >>= 2n}
   if (n & 0x2n) i |= 1n;
   //`+=` has been replaced by `|=` because it's more efficient
   return i
};

BigInt.logB = function(n, b = 3n)
{
   n = BigInt.to(n); b = BigInt(b);
   if (n < 1n || b < 2n) throw new RangeError('return value is -Infinity or NaN');
   let i = 0n;
   while (n > 1n) {n /= b; i++}
   return i
};

Numeric.logB = function(x, b = 2)
{
   x = Numeric.to(x); b = Numeric.to(b);
   if (typeof x != typeof b) throw new TypeError('Mismatched numeric types');
   if (b <= 1) return NaN;
   return (BigInt.is(x) ? BigInt : Math).logB(x, b)
};

Numeric.logStar = function(x, b = 2)
{
   x = Numeric.to(x); b = Numeric.to(b);
   let i = 0;
   while (x > 1) {x = Numeric.logB(x, b); i++}
   return i
};

/*
IIFEs and closures allow "taking a snapshot"
of a var in an outer scope.
This effect essentially allows "pseudo-compilation"
of the function, which makes its behavior constant
unless explicitly replaced.
I saw this "trick" at MDN's `cbrt` polyfill.
I don't know if I should use this in all functions,
as it would be a redundancy mess (it already is, but this would be worse)

A simple solution would be to put EVERYTHING inside a big IIFE,
but it would be tedious to refactor
*/
Math.root = (function(pow){return function(x, n = 2) {return pow(x, 1 / n)}})(Math.pow);

BigInt.root = function(n, i = 2n)
{//ith (degree i) root of n
   n = BigInt.to(n); i = BigInt(i);
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
   x = Numeric.to(x); n = Numeric.to(n);
   if (x != x || n != n) return NaN;
   const a = Numeric.abs(x), zero = x ^ x;
   if (!n) return a > 1 ? NaN : zero;
   if (x < 0 && (BigInt.is(n) && !(n & 1n))) return NaN;
   if (n < 0) return a ? (a == 1 ? Numeric.sign(x) : zero) : Infinity;
   if (!a) return zero;
   if (typeof x != typeof n) throw new TypeError('Mismatched numeric types');
   return (BigInt.is(x) ? BigInt : Math).root(x, n)
};

BigInt.sqrt = function(n)
{//Heron's Method
   n = BigInt.to(n);
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
   {return (x = Numeric.to(x)) < 0 ? NaN : (BigInt.is(x) ? BigInt : Math).sqrt(x)};

{
   /*
   Euclidean algorithm for finding Highest Common Factor.
   returns correct values when inputs are rational numbers
   *whose denominators are any power of 2 (including 2**0)
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
      a = Math.abs(a); b = Math.abs(b);
      if (a != a || b != b) return NaN;
      //let `Euclid` answer the hard questions
      if (a % 1 || b % 1 || a == Infinity || b == Infinity)
         return Euclid(a, b);
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
      const ctz = BigInt.ctz,
         i = ctz(a), j = ctz(b),
         k = BigInt.min(i, j);
      //reduce sizes
      a >>= i; b >>= j;
      /*
      Stein's algorithm is slow when any argument is 1,
      especially if the other argument is a big Mersenne.
      So return early when any value is 1
      */
      if (a == 1n || b == 1n) return 1n << k;
      /*
      Stein alg made me realize that the
      GCD of 2 Mersenne numbers is another Mersenne
      whose size (exponent) equals the GCD of the sizes of the args.
      Example: GCD(0b111111, 0b11111111) = 0b11
      because GCD(6, 8) = 2.
      In case you didn't know,
      `bigMersenne - smallMersenne = bigMersenne ^ smallMersenne`.
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
         for(;;)
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
}

Numeric.gcd = function(a, b)
{
   a = Numeric.abs(a); b = Numeric.abs(b); //avoid tail-calling `Numeric.to` and `Numeric.abs`
   return BigInt.is(a) && BigInt.is(b) ? BigInt.gcd(a, b) : Math.gcd(a, b)
};

Math.lcm = function(a, b)
{
   a = Math.abs(a); b = Math.abs(b);
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
   a = Numeric.abs(a); b = Numeric.abs(b);
   const rt = Numeric.sqrt(ab), u = BigInt.is(a) ? 1n : 1;
   for (let i = u + u; i <= rt; i++)
      {if (!(a % i || b % i)) return i}
   return u
};

Math.agm = function(a, g)
{
   a = +a; g = +g;
   //avoid infinite loop
   if (a != a || g != g || a < 0 || g < 0)
      return NaN;
   let x;
   do [a, g, x] = [(a + g) / 2, Math.sqrt(a * g), a]
   while (a != x) //this condition allows max precision
   //and prevents infinite loop caused by rounding error
   return a
};

BigInt.agm = function(a, g)
{
   a = BigInt.to(a); g = BigInt.to(g);
   do [a, g] = [(a + g) / 2n, BigInt.sqrt(a * g)]
   while (a != g)
   return a
};

//Arithmetic-Geometric Mean
Numeric.agm = function(a, g)
{
   a = Numeric.to(a); g = Numeric.to(g);
   //avoid throw on negative BigInt
   if (a < 0n || g < 0n) return NaN;
   return (BigInt.is(a) && BigInt.is(g) ? BigInt : Math).agm(a, g)
};

{
   const Leyland = (x, y) => x ** y + y ** x;
   Math.Leyland = function(x, y) {return Leyland(+x, +y)};
   BigInt.Leyland = function(a, b)
      {return Leyland(BigInt.to(a), BigInt.to(b))};
   Numeric.Leyland = function(a, b)
      {return Leyland(Numeric.to(a), Numeric.to(b))};
}

//returns non-trivial divisors (proper divs) of n
Math.divisors = function(n)
{
   n = Math.trunc(Math.abs(n));
   const m = Math.sqrt(n), out = [];
   let i = 2;
   while (i <= m) {if (!(n % i)) out.push(i); i++};
   i = out.length - Math.isSquare(n) - 1;
   while (i >= 0) out.push(n / out[i--]);
   return out
};

//array of sorted Primes, no gaps (dense)
let Pa = [3, 5]; //2 is unnecessary because CTZ
//Primality "dictionary", any order, gaps allowed (sparse)
let Pd = new Set([2, 3, 5]);
//find next prime and store it
let addP = function()
{
   let x = +(Pa.at(-1)) + 2;
   //avoid infinite loop
   if (x >= 2 ** 53) return true; //no more primes
   loop:
   for (let j; true; x += 2)
   {
      if (Pd.has(x)) break;
      if (Math.isSquare(x)) continue;
      j = 0;
      while (Pa[j] <= Math.sqrt(x))
         {if (x % Pa[j++] == 0) continue loop;}
      Pd.add(x); break;
   }
   Pa.push(x); return false;
};

//get prime factorization of n
Math.factorize = function(n)
{
   /*
   `floor` and `trunc` are the same here,
   but `trunc` means "get int part"
   and this is EXACTLY what must be done
   */
   n = Math.trunc(Math.abs(n));
   if (!isFinite(n)) return; //returning `undefined` is "more correct"
   const out = new Map, ctz = Numeric.ctz(n);
   if (ctz) {out.set(2, ctz); n /= 2 ** ctz}
   if (n < 2) return out;
   let rt = 1, y = Math.sqrt(n);
   //trial rooting
   while (Math.isSquare(n)) {n = y; y = Math.sqrt(y); rt *= 2}
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
   i = 0; y = Math.sqrt(n);
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
}

/*
I don't want to add inefficient naive algorithms,
that's why there's no `factorize` nor `divisors` for BigInts.
I wanted to add Euler's Totient func but the naive algo is EXTREMELY slow
*/

{
   //factorial approximation for non-integers
   const Gosper = x => Math.sqrt((+x + 1 / 6) * Math.TAU) * (x / Math.E) ** x;
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
      if (!isFinite(x)) return NaN;
      if (x % 1) return (F ? Gosper : Gamma)(x);
      let s, out = 1;
      [s, x] = Numeric.signSplit(x);
      for (let i = 2; i <= x; i++)
         out *= i;
      return out * (x % 2 ? s : 1)
   };

   BigInt.factorial = function(n)
   {
      n = BigInt.to(n);
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
      k = Numeric.to(k);
      if (!BigInt.is(k)) k = Math.trunc(k);
      k = x[0] * k; x = x[1];
      const out = [BigInt.is(x) ? 1n : 1];
      for (let i = k; out.length <= x; i += k)
         out.push(i * out.at(-1));
      return out
   };
}

//iterative inverse Fact
Numeric.factorial_inv = function(n, k = 1)
{//if k > 1 returns corresponding inv multifactorial
   n = Numeric.to(n); k = Numeric.to(k);
   if (!n || k != k) return NaN;
   if (!isFinite(n)) return n;
   const o = BigInt.is(n) ? BigInt : Math;
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
   x = Numeric.to(x);
   const U = BigInt.is(x) ? 1n : 1,
      B = U + U;
   //this approach is slightly faster
   return x % B
      ? (x + U) / B * x
      : x / B * (x + U)
};

//get index of a trinum
Numeric.triNum_inv = function(x)
{
   return BigInt.is(x = Numeric.to(x))
      ? (BigInt.sqrt((x << 3n) | 1n) - 1n) >> 1n
      : (Math.sqrt(8 * x + 1) - 1) / 2
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

{//en.wikipedia.org/wiki/Polygonal_number

   const f0 = Numeric.to, f1 = BigInt.is;

   //get ith polygonal num with s sides
   Numeric.ppn = function(i, s = 3)
   {
      i = f0(i); s = f0(s);
      const B = f1(i) && f1(s) ? 2n : 2;
      s -= B;
      return (s * i*i - i * (s - B)) / B;
   };

   //indexOf polyg num p with s sides
   Numeric.ipn = function(p, s = 3)
   {
      p = f0(p); s = f0(s);
      const B = f1(p) && f1(s) ? 2n : 2;
      s -= B;
      return ((B === 2n ? BigInt : Math).sqrt((B*B*B) * s * p + (s - B) ** B) + (s - B)) / (B * s)
   };

   //get sides of p whose index is i
   Numeric.spn = function(p, i = 2)
   {
      p = f0(p); i = f0(i);
      const U = f1(p) && f1(i) ? 1n : 1,
         B = U + U;
      return (p - i) / (i - U) * (B / i) + B
   };
}

//get Nth Fibonacci faster than recursion
Math.Fib = function(n)
{
   n = Numeric.signSplit(+n);
   return Math.round(Math.PHI ** n[1] / Math.SQRT5) * (n[0] === -1 && n[1] % 2 === 0 ? -1 : 1)
};
//en.wikipedia.org/wiki/Generalizations_of_Fibonacci_numbers#Extension_to_negative_integers

//get index of a Fib num
Math.Fib_inv = function(F)
{
   F = Numeric.signSplit(+F);
   const i = Math.floor(Math.logPHI(F[1] * Math.SQRT5 + 0.5))
   return !(i % 2) && F[0] === -1 ? NaN : i * F[0]
};

//en.wikipedia.org/wiki/Lucas_sequence
//co-recursive Lucas function
//If F is falsy (default) then "U", else "V"
Numeric.Lucas = function(n, P = 1, Q = -1, F)
{
   const f = Numeric.to;
   n = f(n); P = f(P); Q = f(Q);
   const seq = BigInt.is(P) && BigInt.is(Q)
      ? (F ? [2n, P] : [0n, 1n])
      : (F ? [2, P] : [0, 1]);
   while (seq.length <= n)
      seq.push(P * seq.at(-1) - Q * seq.at(-2));
   return seq
};

//TO-DO: insert Dot-Product here


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
