'use strict';

{
   const F = Object.defineProperty;

   F(Array, 'is', Object.getOwnPropertyDescriptor(Array, 'isArray'))

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
   return (Numeric.is(x) ? x.valueOf() :
      isNaN(x) ||
      Math.abs(x) <= Number.MAX_SAFE_INTEGER ||
      //I know /\s/ exists, but `trim` is faster and more readable
      /^[-+]?Infinity$/.test(String(x).trim()) ? +x : BigInt(x)
   )
};

//check if int by coercion
//JS should have this for consistency
defProp(globalThis, 'isInteger',
   function isInt(x) {return BigInt.is(x) || Number.isInteger(+x)}, 0b101
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

Math.LNPHI = Math.log(Math.PHI);
Math.LOG2PHI = Math.log2(Math.PHI);
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
   let i = 0, m;
   if (BigInt.is(a[i])) m = a[i];
   while (++i < a.length)
      {if (BigInt.is(a[i]) && a[i] > m) m = a[i];}
   return m
};
BigInt.min = function(...a)
{
   let i = 0, m;
   if (BigInt.is(a[i])) m = a[i];
   while (++i < a.length)
      {if (BigInt.is(a[i]) && a[i] < m) m = a[i];}
   return m
};

Numeric.max = function(...a)
{
   let i = 0, m;
   if (Numeric.is(a[i])) m = a[i];
   while (++i < a.length)
      {if (Numeric.is(a[i]) && a[i] > m) m = a[i];}
   return m
};
Numeric.min = function(...a)
{
   let i = 0, m;
   if (Numeric.is(a[i])) m = a[i];
   while (++i < a.length)
      {if (Numeric.is(a[i]) && a[i] < m) m = a[i];}
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

BigInt.random = function(n)
{
   const b = BigInt.sizeOf(n, 1n);
   let l = 1n, x = 0n;
   const w = 32n;
   while (l < b)
   {
      x <<= w;
      l += w;
      x |= BigInt(Math.trunc(Math.random() * 2 ** 32))
   }
   //this is biased, sorry
   return x % n
};

//Euclidean division
Math.divEuclid = function(n, d) {return Math.floor(n / Math.abs(d)) * Math.sign(d)};
//the other variants of integer division aren't included,
//because they're too short and simple

//positive r: ceil
//negative r: floor
//neutral r: Euclidean
//falsy r: round
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
   let i = 0n, b = 64n, w = (1n << b) - 1n;
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
   n = Math.abs(Math.trunc(n));
   if (!isFinite(n)) return NaN;
   //`!n === (n === 0)` at this point
   if (!n) return 0x400; //(rounded) `Math.log2(Number.MAX_VALUE)` = (truncated) ilb(2 ^ 1024 - 1) + 1
   if (n % 2) return 0;
   n = Number.toRaw(n);
   const e = ((n >> 52n) & 0x3ffn) - 51n; //abs(exponent), unbiased
   n &= (1n << 52n) - 1n; //mantissa
   //to account for denormalized numbers,
   //this must do ctz on the mantissa
   return Number((n ? BigInt.ctz(n) : 52n) + e)
   /*
   //the following code is ditched
   //because it's probably not efficient
   const c = Math.trunc(Math.log2(n)) - 52;
   if (c > 0) n = Math.trunc(n / 2 ** c); //remove all but the most significant 53b
   return (c > 0 && c) + Math.ctz32(n) + (n >= 2 ** 32 && Math.ctz32(n / 2 ** 32))
   */
};

Numeric.isDivisible = function(n, d)
{
   n = n.valueOf(); d = d.valueOf();
   return typeof n == typeof d && Numeric.isInt(n) && Numeric.isInt(d) && d && !(n % d)
};

BigInt.isPow2 = function(n)
   {return BigInt.is(n) && n > 0n && !(n & (n - 1n))};

BigInt.isMersenne = function(n)
   {return BigInt.is(n) && n > 0n && !(n & (n + 1n))};

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
   //stackoverflow.com/a/18686659
   if (BigInt.asIntN(64, 0x840C04048404040n << BigInt(n)) >= 0n)
      return false;
   const ctz = Numeric.ctz(n);
   if (ctz % 2) return false;
   n /= 2 ** ctz;
   if (n % 8 !== 1) return false;
   return Number.isInteger(Math.sqrt(n))
};

BigInt.isSquare = function(n)
{
   if (!BigInt.is(n)) return false;
   if (n < 2n) return n >= 0n;
   //stackoverflow.com/a/18686659
   if (BigInt.asIntN(64, 0x840C04048404040n << n) >= 0n)
      return false;
   const ctz = BigInt.ctz(n);
   if (ctz & 1n) return false;
   n >>= ctz;
   if ((n & 7n) !== 1n) return false;
   return BigInt.sqrt(n) ** 2n === n
};

Numeric.isSquare = function(n)
{
   if (!Numeric.isInt(n)) return false;
   return (BigInt.is(n) ? BigInt : Math).isSquare(n)
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
   if (b < 2n) throw new RangeError('Invalid logarithm base. return value is -Infinity or NaN');
   //stackoverflow.com/a/7982137
   const d = BigInt.log2(n) - 52n;
   if (d > 0n) n >>= d; //remove all bits BUT the most significant 53
   b = Number(b);
   return BigInt(Math.trunc(Math.logB(Number(n), b) + (d > 0n && (Number(d) * Math.logB(2, b)))));
   //WARNING: this is rounded, not truncated
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

Math.root = function(x, n = 2) {return Math.pow(x, 1 / n)};

BigInt.root = function(n, i = 2n)
{//ith (degree i) root of n
   n = BigInt.to(n); i = BigInt(i);
   if (i == 1n) return n;
   n = Numeric.signSplit(n);
   if (!i) {if (n[1] > 1n) throw new RangeError('return value is NaN'); return 0n}
   if (n[0] === -1n && !(i & 1n)) throw new RangeError('return value is a Complex number');
   if (i < 0n) {if (!n[1]) throw new RangeError('return value is Infinity'); return n[1] == 1n ? n[0] : 0n}
   if (!n[1]) return 0n;
   const j = i - 1n;
   //a ^ (1 / k) = b ^ (log_b(a) / k)
   let x0 = 2n << BigInt.log2(n[1]) / i, //upper bound estimation
       x1 = x0 * j / i + n[1] / (i * x0 ** j); //lower
   while (x1 < x0)
   {//Newton's Method
      x0 = x1;
      x1 = x1 * j / i + n[1] / (i * x1 ** j)
   }
   return x0 * n[0]
};

BigInt.sqrt = function(n)
{//Heron's Method
   n = BigInt.to(n);
   if (n < 2n) {if (n < 0n) throw new RangeError('return value is Complex number'); return n}
   let x0 = 2n << (BigInt.log2(n) >> 1n),
       x1 = (x0 + n / x0) >> 1n;
   while (x1 < x0)
   {
      x0 = x1;
      x1 = (x1 + n / x1) >> 1n
   }
   return x0
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

/**
*@param {*} x
*@return {numeric}
*/
Numeric.sqrt = function(x)
   {return (x = Numeric.to(x)) < 0 ? NaN : (BigInt.is(x) ? BigInt : Math).sqrt(x)};

{
   //Euclidean
   const GCD = (a, b) =>
   {
      while (b) [a, b] = [b, a % b];
      return a
   };

   /**returns correct values when inputs are rational numbers
   *whose denominators are any power of 2 (including 2**0)
   *@param {number} a
   *@param {number} b
   *@return {number} highest common factor of `a` and `b`
   */
   Math.gcd = function(a, b)
   {
      a = +a; b = +b;
      if (a != a || b != b) return NaN;
      return GCD(a, b)
   };

   BigInt.gcd = function(a, b)
   {
      a = BigInt.abs(a); b = BigInt.abs(b);
      //en.wikipedia.org/wiki/Lehmer%27s_GCD_algorithm#Algorithm
      if (b > a) [a, b] = [b, a];
      let a_len = BigInt.sizeOf(a, 64n),
         b_len = BigInt.sizeOf(b, 64n);
      if (b_len < 2) return GCD(a, b);
      let m = a_len - b_len;
      assert(m >= 0, "Negative absolute difference")
      if (m)
      {
         while (!(a & BigInt.U64MAX) && m)
            {a >>= 64n; a_len--; m--}
         b <<= m << 6n; b_len += m;
      }
      assert(a_len === b_len, 'Mismatched Q-word lengths')
      m = a_len;
      while (a && b)
      {
         m--;
         let x = a >> (m << 6n),
            y = b >> (m << 6n),
            [A, B, C, D] = [1n, 0n, 0n, 1n];
         while (true)
         {
            let w0 = (x + A) / (y + C),
               w1 = (x + B) / (y + D),
               w;
            //I'm afraid of deleting the `else`
            if (w0 != w1) {break} else w = w0;
            [A, B, x, C, D, y] =
               [C, D, y, A - w*C, B - w*D, x - w*y];
            if (B) continue;
         }
         if (!B)
         {
            if (b) [a, b] = [b, a % b];
            continue
         }
         [a, b] = [a*A + b*B, C*a + D*b];
         if (b) continue;
      }
      return a
   };

   const a = BigInt.random(1n << 0x100n),
      b = BigInt.random(1n << 0x100n);
   assert(BigInt.gcd(a, b) === GCD(a, b), 'BigInt.gcd is bugged')
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
   //better performance than `a * b / Math.gcd(a, b)`
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

Math.agm = function (a, g)
{
   a = +a; g = +g;
   let x;
   do [a, g, x] = [(a + g) / 2, Math.sqrt(a * g), a]
   while (a !== x) //this condition allows max precision
   //and prevents infinite loops caused by rounding errors
   return a
};

BigInt.agm = function (a, g)
{
   a = BigInt.to(a); g = BigInt.to(g);
   do [a, g] = [(a + g) / 2n, BigInt.sqrt(a * g)]
   while (a !== g)
   return a
}

//Arithmetic-Geometric Mean
Numeric.agm = function(a, g)
{
   a = Numeric.to(a); g = Numeric.to(g);
   if (a < 0n || g < 0n) return NaN; //avoid throw on negative BigInt
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
Numeric.divisors = function(n)
{
   n = Numeric.abs(n); if (!BigInt.is(n)) n = Math.trunc(n);
   const m = Numeric.sqrt(n), out = [];
   let i = BigInt.is(n) ? 2n : 2;
   while (i <= m) {if (Numeric.isDivisible(n, i)) out.push(i); i++};
   i = out.length - Numeric.isSquare(n) - 1;
   while (i >= 0) out.push(n / out[i--]);
   return out
};

let Pa = [3, 5]; //2 is unnecessary
//array of sorted Primes, no gaps (dense)
let Pd = new Set([2, 3, 5]);
//Primality "dictionary", any order, gaps allowed (sparse)
let addP = function()
{//find next prime and store it
   let x = Pa.at(-1) + 2;
   loop:
   for (let y = Math.sqrt(x), j; true; x += 2, y = Math.sqrt(x))
   {
      if (Pd.has(x)) break;
      if (y === Math.trunc(y)) continue; //ignore perfect squares because they are composite
      j = 1;
      while (Pa[j] <= y)
         {if (x % Pa[j++] === 0) continue loop;}
      Pd.add(x); break;
   }
   Pa.push(x)
};

Math.factorize = function(n) //get prime factorization of n
{
   n = Math.trunc(Math.abs(n));
   if (!isFinite(n)) return; //returning `undefined` is "more correct"
   const out = new Map;
   if (n < 2) return out; //0 and 1 don't have factorization
   let rt = 1, y = Math.sqrt(n);
   //TO-DO: replace with a better root-degree-finding algorithm
   while (Math.isSquare(n)) {n = y; y = Math.sqrt(y); rt *= 2}
   let i = 0;
   const ctz = Numeric.ctz(n);
   //binary speed-hack
   if (ctz) {out.set(2, ctz * rt); n /= 2 ** ctz}
   if (Pd.has(n)) {out.set(n, (out.get(n) || 0) + rt); return out}
   while (Pa[i] <= y && Pa[i] <= n)
   {
      while (n % Pa[i] === 0)
      {
         out.set(Pa[i], (out.get(Pa[i]) || 0) + rt);
         n /= Pa[i];
         if (Pd.has(n)) {out.set(n, (out.get(n) || 0) + rt); return out}
      }
      if (++i >= Pa.length) addP(); //Primes on-demand
   }
   if (n > 1) {out.set(n, (out.get(n) || 0) + rt); Pd.add(n)}
   return out
}

{
   //factorial approximation for non-integers
   const Gosper = x => Math.sqrt((x + 1 / 6) * Math.TAU) * (x / Math.E) ** x;
   //Gosper's. because Stirling's crappy
   
   //Gamma Function defined as Summation instead of Integration
   const Gamma = x =>
   {
      let t = 1, s0, s1 = 0 ** x; //0 ^ 0 = 1
      do {s0 = s1; s1 += t ** x * Math.exp(-t); t++}
      while (s0 !== s1);
      return s0
   };
   //easy switch between approximations
   const F = 1 ? Gosper : Gamma;
   
   Math.factorial = function(x)
   {
      x = +x;
      if (x == Infinity) return x;
      if (!isFinite(x)) return NaN;
      if (x % 1) return F(x);
      let s, out = 1;
      [s, x] = Numeric.signSplit(x);
      for (let i = 2; i <= x; i++)
         out *= i;
      return out * (x % 2 ? s : 1)
   };

   BigInt.factorial = function(n)
   {
      n = BigInt.to(n);
      let s, out = 1n;
      [s, n] = Numeric.signSplit(n);
      for (let i = 2n; i <= n; i++)
         out *= i;
      return out * (n & 1n ? s : 1n)
      /*
      this algorithm isn't good for BigInts
      these are better:
      http://www.luschny.de/math/factorial/FastFactorialFunctions.htm
      github.com/PeterLuschny/Fast-Factorial-Functions
      https://web.archive.org/web/20050211005140/http://www.luschny.de/math/factorial/Description.htm
      */
   };

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
   return BigInt.is(x = Numeric.to(x))
      ? x * (x + 1n) / 2n
      : x * (x + 1) / 2
};

//get index of a trinum
Numeric.triNum_inv = function(x)
{
   return BigInt.is(x = Numeric.to(x))
      ? (BigInt.sqrt((x << 3n) + 1n) - 1n) >> 1n
      : (Math.sqrt(8 * x + 1) - 1) / 2
};

//get TriNums up to index x (inclusive)
Numeric.triSeq = function(x)
{
   x = Numeric.signSplit(x);
   const out = [x ^ x]; //Mathematical "Adaptive" Zero
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
   while (seq.length <= n) seq.push(P * seq.at(-1) - Q * seq.at(-2));
   return seq
};

//TO-DO: insert Dot-Product here


//generalized Collatz
//en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations
Numeric.Collatz_gen = function(n, k = 2, a=[[1, 2], [3, 1]], b=[[0, 1], [1, 1]], P = 2)
{
   n = Numeric.to(n);
   if (!isFinite(n)) return; //`undefined` is more correct than `[]`
   P = Numeric.to(P);
   if (!BigInt.is(P)) P = Math.trunc(P);
   const seq = [n]; let i, tmp;
   const addFrac = (f0, f1) => {
      //format is [num, den]
      const x = Numeric.lcm(f0[1], f1[1]);
      return [x / f0[1] * f0[0] + x / f1[1] * f1[0], x]
   };
   while (seq.length < Number(k))
   {
      i = seq.at(-1) % P;
      tmp = addFrac([seq.at(-1) * a.at(i)[0] / a.at(i)[1], 1], b.at(i));
      seq.push(tmp[0] / tmp[1])
   }
   return seq.slice(1)
};

/*
Returns (Hailstone) seq of n. Supports signed integers.
You can explicitly specify the k steps, or let it detect known cycles.
Falsy s: Standard
Truthy s: "Shortcut" version
"Shortcut" is like Standard but skips some Even numbers
en.wikipedia.org/wiki/Collatz_conjecture
*/
Numeric.Collatz_std = function(n, k, s)
{
   n = Numeric.to(n); k = Number(k);
   const h = [];
   if (BigInt.is(n))
   {
      h.push(n);
      const c = new Set([0n, 1n, -1n, -5n, -17n]);
      while (k ? h.length < k : !c.has(h.at(-1)))
         h.push(h.at(-1) & 1n ? (3n * h.at(-1) + 1n) / (s ? 2n : 1n) : h.at(-1) / 2n);
   }
   else
   {
      h.push(Math.trunc(n));
      const c = new Set([0, 1, -1, -5, -17, Infinity, -Infinity, NaN]);
      while (k ? h.length < k : !c.has(h.at(-1)))
         h.push(h.at(-1) % 2 ? (3 * h.at(-1) + 1) / (s ? 2 : 1) : h.at(-1) / 2);
   }
   return h.slice(1)
};


/*
The following are all Work In Progress:

//Division by repeated subtraction, but the divisor gets decremented each iteration
function decayDiv(n, d)
{
   [n, d] = [singSplit(n), singSplit(d)];
   let i = BigInt.is(n[0]) ? 0n : 0;
   while (n[1] > d[1])
      {n[1] -= d[1]--; i++}
   return [n[0] * i, n[0] * n[1], d[0] * d[1]]
   //quotient, remainder, and unnamed, lol
}

//Multiplication by repeated addition, but multiplier gets decremented
function decayMult0(f, m)
{
   [f, m] = [singSplit(f), singSplit(m)];
   if (!f[0] || !m[0]) return f[0] * m[0]; //if NaN or 0 then No-Op
   let i = BigInt.is(m[0]) ? 0n : 0, x = f[1];
   while (i < m[1])
      {x += f[1]; m[1]--; i++}
   return [n[0] * i, n[0] * n[1], d[0] * d[1]]
}

//"multiplicand" (factor) gets decremented
function decayMult1(f, m)
{
   
}

//returns the digit at index i of a numeral in base/radix B, with numeric value N
let getDigit = (n, b, i) => {
   n = n / b ** i % b;
   return Numeric.isInt(n) ? n : Math.trunc(n)
};

//prints a Natural number n to its corresponding numeral in base B
let toNumeral = function(N, B)
{
   const dig = [];
   while (N > 0) {dig.push(N % B); N = N / B - N % B};
   return dig.reverse().join('')
};
//for performance I avoided using unshift(), reverse() should be faster

//parses a numeral in base B and returns its value
let parseNumeral = function(numeral, B)
{
   let n = 0;
   for (d of numeral) {n = b * n + d};
   return n
};

//convert the digits representation of a number from a base/radix to another
let B2B = (numeral, inpB, outB) => toNumeral(parseNumeral(numeral, inpB), outB);

//en.wikipedia.org/wiki/Digital_root#Congruence_formula
function dig_rt_c(n, b)
{
   return (
      BigInt.is(n) && BigInt.is(b) ?
      (n && ((n - 1n) % (b - 1n) + 1n) : 0n)
      :
      (n !== 0 ? ((n - 1) % (b - 1) + 1) : 0)
   )
};

//en.wikipedia.org/wiki/Digital_root
let dig_sum = function(x, b)
{
   let sum;
   if (BigInt.is(x) && BigInt.is(b))
   {
      if (!b) return Infinity;
      sum = 0n;
      if (BigInt.abs(b) === 1n) return sum;
      while (x) {sum += x % b; x /= b)};
   };
   else
   {
      x = +x; b = +b;
      if (!isFinite(x) || !isFinite(b) || b === 0) return x / b;
      sum = 0;
      if (Math.abs(b) === 1) return sum;
      while (x) {sum += x % b; x = Math.trunc(x / b)};
   };
   return sum
};

//persistence == seen.length - 1
let dig_rt_a = function(x, b)
{
   const seen = new Set;
   do {seen.add(x); x = dig_sum(x, b)} while (!seen.has(x));
   console.log(seen) //DEBUG
   return x
};

//en.wikipedia.org/wiki/Multiplicative_digital_root
let dig_prod = function(x, b)
{
   if (BigInt.is(x) && b === 2n)
   {//missing nega-binary optimization
      x = Numeric.signSplit(x);
      return BigInt(BigInt.isMersenne(x[1])) * x[0]
   }
   x = Math.trunc(x); b = Math.trunc(b);
   let prod = 1, mod;
   while (x > 1)
   {
      mod = x % b;
      if (mod === 0) return 0;
      prod *= mod;
      x = Math.trunc(x / b)
   };
   return prod
};

let dig_rt_m = function(x, b)
{
   const seen = new Set;
   do {seen.add(x); x = dig_prod(x, b)} while (!seen.has(x));
   console.log(seen) //DEBUG
   return x
};

TO-DO: add a function that tests if the sum of the digit sum and digit product
are equal to the input itself.
Example in decimal: 69 = 6*9 + 6+9

TO-DO: add function to test if number equals sum of divisors
with the option to include or exclude 1
*/

//END OF VANILLA JS
//BEGIN classes

/*
most methods have a parameter `r` at the end,
this is "in-place mode" or "replacer",
it has side effects but can improve performance and conciseness.
if false, the method will create more BigFloats.

for example, `x.add(1, true)` is analogous to `x += 1`
but `x.add(1)` is just `x + 1`
*/
globalThis.BigFloat = class BigFloat
{
   //default maximum fractional size (in bits)
   static PRECISION = 0x100n;
   
   //aliases of common constants
   static ZERO = new BigFloat;
   static HALF = new BigFloat(0.5);
   static ONE = new BigFloat(1n);
   static TWO = new BigFloat(2n);
   static THREE = new BigFloat(3n);

   //get/compute Pi
   //(missing algorithm)
   static PI (p = BigFloat.PRECISION)
   {
      return new BigFloat(Math.PI)
   }

   static TAU (p = BigFloat.PRECISION)
   {
      let x = BigFloat.PI(++p);
      x.exponent++
      return x
   }

   //Euler's number
   static E (p = BigFloat.PRECISION)
   {
      if (!BigInt.is(p)) p = BigInt(Math.trunc(p));
      p = BigInt.abs(p);
      let x = new BigFloat(1);
      x.exponent = -p + 1n;
      let y = new BigFloat(1);
      y.exponent = p - 1n;
      return x.add(1).pow(y, p);
   }

   //Golden Ratio
   static PHI (p = BigFloat.PRECISION)
   {
      let x = BigFloat.sqrt(5, --p).add(1);
      x.exponent--
      return x
   }

   constructor(x = 0n)
   {
      x = x.valueOf();
      this.exponent = 0n;
      this.mantissa = 0n;
      switch (typeof x)
      {
         case 'number':
            if (!isFinite(x)) throw new RangeError('Invalid Number');
            if (!x) break;
            let e = 0;
            //shift left until integer
            while (x % 1) {x *= 2; e--}
            this.exponent = BigInt(e);
            this.mantissa = BigInt(x);
            break;
         
         case 'bigint':
            this.mantissa = x;
            break;

         default:
            if (x instanceof BigFloat)
            {
               this.exponent = BigInt(x.exponent);
               this.mantissa = BigInt(x.mantissa);
               break
            }
            //again, `trim` is faster and more readable than `\s*?`
            x = String(x).trim().split('.');

            //do if decimal base
            if (!(/^[-+]?0[box]/.test(x[0]))) //"box" lol
            {
               //partial decimal support
               //only parses integer part
               this.mantissa = BigInt(x[0]);
               break
            }
            const b = {'0b': 0, '0o': 2, '0x': 3}[x[0].slice(0, 2)];
            if (x[1]) this.exponent = -BigInt(x[1].length + b);
            this.mantissa = BigInt(x.join(''));
      }
      //manually normalize
      //because `this = something` is a syntax error
      const c = this.mantissa && BigInt.ctz(this.mantissa);
      this.mantissa >>= c;
      this.exponent += c;
      /*
      //TODO: support recurring digits
      this.recurring0 = 0n;
      this.recurring1 = -1n;
      //if start > end (0 & 1 respectively), then it's not recurring
      */
   }

   //same as constructor, but doesn't normalize,
   //and allows in-place modification
   sanitize(r)
   {
      let y = r ? this : new BigFloat;
      y.exponent = BigInt(this.exponent);
      y.mantissa = BigInt(this.mantissa);
      return y
   }
   //TODO: use Proxy for event-driven sanitizing

   //make exponents equal, preserve numerical value
   align(b, r)
   {
      let x = this.sanitize(r).normalize(r),
         y = b instanceof BigFloat ? b.sanitize(r).normalize(r) : new BigFloat(b);
      if (x.exponent > 0n)
         {x.mantissa <<= x.exponent; x.exponent = 0n}
      if (y.exponent > 0n)
         {y.mantissa <<= y.exponent; y.exponent = 0n}
      const e = x.exponent - y.exponent;
      if (e < 0n)
      {//y has a more positive exponent
         y.exponent += e;
         y.mantissa <<= -e
      }
      else
      {
         x.exponent -= e;
         x.mantissa <<= e
      }
      return [x, y]
   }

   //reduce memory usage
   normalize(r)
   {
      let x = this.sanitize(r);
      if (x.mantissa)
      {
         const c = BigInt.ctz(x.mantissa);
         x.mantissa >>= c;
         x.exponent += c
      }
      else x.exponent = 0n;
      return x
   }

   static abs(x)
   {
      x = new BigFloat(x);
      x.mantissa = BigInt.abs(x.mantissa);
      return x
   }
   //BigFloat.sign(x)
   //BigInt.sign(x.mantissa)

   /**
   *compare.
   *@param {bigfloat} x
   *@return {number} the sign of `this.sub(x)`
   */
   cmp(x)
   {
      let [a, b] = this.align(x);
      a = a.mantissa; b = b.mantissa;
      return a == b ? 0 : (a > b ? 1 : -1)
   }

   add(f, r)
   {
      let x;
      [x, f] = this.align(f, r);
      x.mantissa += f.mantissa;
      return x.normalize(r)
   }

   sub(f, r)
   {
      let x;
      [x, f] = this.align(f, r);
      x.mantissa -= f.mantissa;
      return x.normalize(r)
   }

   mul(f, p = BigFloat.PRECISION, r)
   {
      f = new BigFloat(f); 
      let x = this.normalize(r);
      const e = x.exponent + f.exponent;
      //get max fractional size from both operands
      let b = -BigInt.min(x.exponent, f.exponent, 0n);
      b = b < p ? p - b : 0n;
      x.align(f, true);
      x.mantissa <<= b;
      f.mantissa <<= b;
      x.mantissa *= f.mantissa;
      x.normalize(true);
      x.exponent = e;
      return x
   }

   /*
   I'M LOSING MY MIND WITH THIS CRAP
   IT DOESN'T WORK, even though it's defined EXACTLY like `mul`
   but subtracting exponents and dividing mantissas.
   IT SHOULD WORK, WHY IS THE EXPONENT WRONG?
   I've already patched this like 64 TIMES
   */
   div(f, p = BigFloat.PRECISION, r)
   {
      f = new BigFloat(f); 
      let x = this.normalize(r);
      const e = x.exponent - f.exponent;
      let b = -BigInt.min(x.exponent, f.exponent, 0n);
      b = b < p ? p - b : 0n;
      x.align(f, true);
      x.mantissa <<= b;
      f.mantissa <<= b;
      x.mantissa /= f.mantissa;
      x.normalize(true);
      x.exponent = e;
      return x
   }

   //NOT the standard mathematical modulo
   //just trunc-div remainder
   mod(f, r)
   {
      let x;
      [x, f] = this.align(f, r);
      x.mantissa %= f.mantissa;
      return x.normalize(r)
   }

   pow(f, p, r)
   {
      f = new BigFloat(f);
      let x = this.sanitize(r),
         root = f.mod(1).mantissa //fractional part of power degree
            ? BigFloat.root(x, BigFloat.ONE.div(root, p), p)
            : new BigFloat(1);
         //a ^ 2.5 = a ^ 2 * a ^ 0.5

      f = f.toBigInt();
      const s = f < 0n;
      if (s) f = -f;
      let y = new BigFloat(x);

      while (f > 1n)
      {
         x.mul(y, p, true);
         f--
      }
      /*
      *TODO: replace by this algorithm:
      let prod = new BigFloat.(1n);
      prod.exponent = trunc(log2(x).mul(f)).toBigInt();
      rt = BigInt.ONE.div((log2(x).mul(f)).mod(1));
      return prod.mul(root(2, rt))
      */
      //ALT algorithm: there's a possibility that `**` will work only when exponent is uint
      x.mul(root, p, true);
      if (s)
      {
         //handle negative power
         //a ^ -b = 1 / a ^ b
         y = BigFloat.ONE.div(x, p);
         //preserve "in-place mode"
         x.mantissa = y.mantissa;
         x.exponent = y.exponent;
      }
      return x
   }

   //floored binary logarithm
   static ilog2(x)
   {
      x = new BigFloat(x);
      return (new BigFloat(x.exponent + BigInt.log2(x.mantissa)))
   }

   static log2(x)
   {
      x = new BigFloat(x);
      x.exponent -= 1n; //wrong
      return x
   }

   static sqrt(x, p)
   {
      x = new BigFloat(x);
      if (x.mantissa < 0n) throw new RangeError('return value is Complex number');
      if (!x.mantissa) return new BigFloat;
      let x0 = new BigFloat(2n);
      x0.exponent += BigInt(BigFloat.ilog2(x).div(2n, p));
      let x1 = x.div(x0, p).add(x0).div(2n, p);
      while (x1.cmp(x0) == -1)
      {
         x0 = x1;
         x1 = x.div(x1, p).add(x1).div(2n, p)
      }
      return x0
   }

   static root(n, i)
   {
      n = new BigFloat(n); i = new BigFloat(i);
      if (i.cmp(1n) == 0) return n;
      const s = BigInt.sign(n.mantissa);
      n.mantissa *= s; //abs
      if (!i.mantissa)
      {
         if (n.cmp(1n) == 1) throw new RangeError('return value is NaN');
         return new BigFloat
      }
      if (s == -1n && !i.mod(2n).mantissa)
         throw new RangeError('return value is Complex number');
      if (i.mantissa < 0n)
      {
         if (!n.mantissa) throw new RangeError('return value is Infinity');
         return new BigFloat(n.cmp(1n) && s)
      }
      if (!n.mantissa) return n;
      const j = i.sub(1);
      let x0 = new BigFloat(2);
      x0.exponent += BigInt(BigFloat.ilog2(n).div(i, p));
      let x1 = x0.mul(j).div(i).add(n[1].div(x0.pow(j).mul(i)));
      while (x1.cmp(x0) == -1)
      {
         x0 = x1;
         x1 = x1.mul(j).div(i).add(n.div(x1.pow(j).mul(i)))
      }
      x0.mantissa *= s;
      return x0
   }

   static isInt(x)
   {
      if (!(x instanceof BigFloat))
         return false;
      x = x.sanitize();
      //`sanitize` doesn't normalize, so CTZ must be checked
      return !x.mantissa || 0n <= x.exponent + BigInt.ctz(x.mantissa)
   }

   //keeps integer part by default
   //but can remove a custom amount of bits
   static trunc(x, b = 0n, r)
   {
      x = new BigFloat(x);
      b = BigInt(b);
      if (b)
      {
         x.mantissa >>= b;
         x.exponent += b
      }
      else
      {
         //`x` is guaranteed to be normalized,
         //so checking exp sign is enough to know if it's an int
         if (x.exponent < 0n)
         {
            x.mantissa >>= -x.exponent;
            x.exponent = 0n
         }
      }
      return x.normalize(r)
   }

   toNumber()
   {
      return Number(this.mantissa) * 2 ** Number(this.exponent)
   }

   toBigInt()
   {
      const x = BigFloat.trunc(this);
      return x.mantissa << x.exponent
   }

   //TODO: support multiple bases
   toString(b)
   {
      const x = new BigFloat(this);
      let S = x.mantissa.toString(16);
      const e = Number(x.exponent + 3n);
      if (e < 0)
         S = S.slice(0, e) + '.' + S.slice(e);
      return S
   }
};
for (const O of ['ZERO', 'HALF', 'ONE', 'TWO', 'THREE'])
{
   for (const k of ['mantissa', 'exponent'])
      defProp(BigFloat[O], k, BigFloat[O][k], 0);
}


//based on: github.com/infusion/Complex.js/blob/master/complex.js
globalThis.BigComplex = class BigComplex
{
   constructor(x)
   {
      x = x.valueOf();
      this.real = new BigFloat;
      this.imagin = new BigFloat;
      //WARNING: Infinite recursion
      if (x instanceof BigFloat || Numeric.is(x))
         this.real = new BigFloat(x)
      else
      {
         x = String(x).split(/[+-]/);
         //missing sign handling
         if (x[0].includes(/[ij]/))
            this.imagin = new BigFloat(x[0].slice(0, -1))
         else
            this.real = new BigFloat(x[0]);

         if (x[1].includes(/[ij]/))
            this.imagin.add(x[0].slice(0, -1))
         else
            this.real.add(x[0]);
      }
   }

   add(x, r)
   {
      if (!(x instanceof BigComplex))
         x = new BigComplex(x);
      let c = r ? this : new BigComplex();
      c.real.add(x.real, 1);
      c.imagin.add(x.imagin, 1);
      return c
   }

   sub(x, r)
   {
      if (!(x instanceof BigComplex))
         x = new BigComplex(x);
      let c = r ? this : new BigComplex();
      c.real.sub(x.real, 1);
      c.imagin.sub(x.imagin, 1);
      return c
   }
};

//correction of data descriptors
//to make everything equal to vanilla JS
for (const O of [Number, Math, BigInt, Numeric, BigFloat, BigComplex])
{
   //`for in` is slower and has more potential side-effects
   for (const k of Object.keys(O))
   {
      defProp(O, k, O[k], +(typeof O[k] == 'function') && 0b101)
      if (typeof O[k] == 'function') defProp(O[k], 'name', O[k].name || k, 1);
   }
}

for (const k of ['AssertionError', 'BigFloat', 'BigComplex'])
   defProp(globalThis, k, globalThis[k], 0b101);
