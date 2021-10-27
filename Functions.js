'use strict';

const assert = function(c, m, e) {if (!c) throw new (typeof e == 'function' ? e : Error)(m);};
//`seal` and `freeze` are commented because maybe they aren't a good idea
//Object.seal(assert);
//Object.freeze(assert);

{//block-scoping to make `at` temporary

   //github.com/tc39/proposal-relative-indexing-method#polyfill
   function at(n)
   {
      let l = this.length;
      //BigInt (and object-wrapped bigint) support
      if (BigInt.is(n))
         {l = BigInt(l)}
      else
         n = Math.trunc(n) || 0;
      if (n < 0) n += l;
      return n < 0 || n >= l ? undefined : this[n]
   };
   for (const C of [Array, String, Reflect.getPrototypeOf(Int8Array)])
      Object.defineProperty(C.prototype, "at",
         {value: at, writable: true, configurable: true});
}

//the main numeric object
//the name is inspired by Ecmascript's `toNumeric` abstract function
Object.defineProperty(globalThis, 'Numeric', {value: {}, writable: true, configurable: true});
//this is intended to work with any numerical value

//returns the internal bits of a number
//the IEEE 754 representation as BigInt
Number.toRaw = function float2raw(x)
   {return new BigUint64Array(new Float64Array([x]).buffer)[0]};
//missing hex support in both methods

//returns the numerical value of the BigInt when read as IEEE 754
Number.fromRaw = function raw2float(x)
   {return new Float64Array(new BigUint64Array([x]).buffer)[0]};

//check signed/negative zero
Number.isMinusZero = function(x) {return x === 0 && 1 / x < 0};

//short alias
Object.defineProperty(Array, 'is',
   Object.getOwnPropertyDescriptor(Array, 'isArray')
)

Number.is = function isNumber(x) {return typeof x.valueOf() == 'number'};

//if a BigInt is wrapped in an object,
//this will return false, which is wrong
BigInt.is = function isBigInt(x) {return typeof x.valueOf() == 'bigint'};
//IDK if this is the same as `typeof x == 'bigint' || x instanceof BigInt`

//check if numeric
Numeric.is = function isNumeric(x) {return Number.is(x) || BigInt.is(x)};

//coerce to numeric
//by using the least invasive algorithm I know
Numeric.to = function toNumeric(x)
   {return Numeric.is(x) ? x : isNaN(x) || Math.abs(x) <= Number.MAX_SAFE_INTEGER || /\s*?[-+]?Infinity\s*?/.test(x) ? +x : BigInt(x)};

//check if int by coercion
//JS should have this for consistency
Object.defineProperty(globalThis, "isInteger", {value: function(x)
   {return BigInt.is(x) || Number.isInteger(+x)}, //to avoid throwing, order MUST be like this
   writable: true, configurable: true});

//check if strictly any integer
Numeric.isInt = function(x) {return Number.isInteger(x) || BigInt.is(x)};
//order is reversed to reduce probability of latency
//because most inputs will be of type `Number`

//`Number.isFinite` must only work with `Number` values,
//but the global version is intended to work with any value,
//this is why I HAD to replace it
isFinite = function(x)
{
   return BigInt.is(x) || ((x = +x) == x && x != Infinity && x != -Infinity)
   //algorithm similar to:
   //https://tc39.es/ecma262/multipage/abstract-operations.html#sec-tonumeric
};


//docs.oracle.com/javase/7/docs/api/java/lang/Double.html#MIN_NORMAL
Number.MIN_NORMAL = Math.pow(2, -1022);

Math.TAU = Math.PI * 2; //no accuracy loss
//because multiplier is power of two

Math.SQRT5 = Math.sqrt(5);

//Golden Ratio
Math.PHI = Math.SQRT5 / 2 + 0.5;

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
BigInt.U64MAX = (1n << 64n) - 1n;

//Maximum signed 64bit value
BigInt.S64MAX = (1n << 63n) - 1n;

//Minimum signed 64bit value
BigInt.S64MIN = -1n << 63n;


//github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.math.signbit.js
Math.signbit = function(x)
   {return (x = +x) == x && x < 0 || Number.isMinusZero(x)};

//for consistency, no static method will be an arrow function
BigInt.sign = function(n)
{
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
   return n && (n < 0n ? -1n : 1n)
};
BigInt.abs = function(n)
{
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
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
   const {is, max, min} = BigInt;
   if (!(is(n) && is(m0) && is(m1))) throw new TypeError(['Expected BigInts', n, m0, m1]);
   if (m0 > m1) [m0, m1] = [m1, m0];
   return max(min(n, m1), m0)
};

Numeric.clamp = function(x, m0, m1)
{
   const {to, max, min} = Numeric;
   return max(min(to(x), to(m1)), to(m0))
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
   //the NaN checks aren't necessary because it will be optimized
   return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow
};

//round towards unsigned (any) Infinity
Math.truncInf = function(x) {return Math[+x < 0 ? 'floor' : 'ceil'](x)};

//Euclidean division
Math.divEuclid = function(n, d) {return Math.floor(n / Math.abs(d)) * Math.sign(d)};
//the other variants of integer division aren't included,
//because they're too short and simple.

//positive r: ceil
//negative r: floor
//neutral r: Euclidean
//falsy r: round
BigInt.div = function(n, d, r)
{//n and d are dividend and divisor respectively
   if (!(BigInt.is(n) && BigInt.is(d))) throw new TypeError(['Expected BigInts', n, d]);
   if (!(n % d)) return n / d;
   const s = (n < 0n) != (d < 0n);
   return (
      r ? n / d + (r > 0 ? (s ? 0n : 1n) : (s ? -1n : 0n))
      : (r == 0 ?
         n / BigInt.abs(d) - (n < 0n ? 1n : 0n) * BigInt.sign(d)
         : ((s ? -d : d) / 2n + n) / d)
   )
};

{//temporary `mod` variable
   //modulo, NOT remainder
   const mod = (a, n) => (a % n + n) % n;
   //TO-DO: add the other definitions:
   //en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition

   Math.mod = function(a, n) {return mod(+a, +n)};
   //Math is racist against BigInt, but accepts everyone else

   BigInt.mod = function(a, n)
   {//BigInt is purist, rejects everyone except its own kind
      if (!(BigInt.is(a) && BigInt.is(n))) throw new TypeError(['Expected BigInts', a, n]);
      return mod(a, n)
   };

   /*
   The `Numeric` family accepts everyone as they are.
   And if they aren't numeric, it helps them find their best fitting form
   such that they are comfortables with themselves.
   */
   Numeric.mod = function(a, n) {return mod(Numeric.to(a), Numeric.to(n))};
   //in a nutshell, you've learned the differences between methods of different objects
}

//converts degrees to radians by default
Math.angle2Rad = function(a, scale = 360) {return Math.TAU / scale * a};
//scale = 360: degrees
//scale = 1: Tau radians

//converts radians to degrees by default
Math.rad2Angle = function(r, scale = 360) {return r / (Math.TAU / scale)};

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
Math.sqrTrig = function(x)
{
   x = Math.mod(x, Math.TAU); //normalize to simplify comparisons
   return x && Math.sign(Math.PI - x)
};


Math.ctz32 = function(n) {return n | 0 ? 31 - Math.clz32(n & -n) : 32};
//count trailing zeros in binary
BigInt.ctz = function(n)
{
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
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
   if (!n) return 0x400; //(rounded) `Math.log2(Number.MAX_VALUE)` = (truncated) ilog_2(2 ^ 1024 - 1) + 1
   if (n % 2) return 0;
   n = Number.toRaw(n);
   const e = ((n >> 52n) & 0x3ffn) - 51n; //abs(exponent), unbiased
   n &= (1n << 52n) - 1n; //mantissa
   return Number((n ? BigInt.ctz(n) : 52n) + e)
   /*
   //the following code is ditched
   //because it's probably not efficient
   const c = Math.trunc(Math.log2(n)) - 52;
   if (c > 0) n = Math.trunc(n / 2 ** c); //remove all but the most significant 53b
   return (c > 0 && c) + Math.ctz32(n) + (n >= 2 ** 32 && Math.ctz32(n / 2 ** 32))
   */
};

Numeric.isDivisible = function(n, m)
   {return typeof n.valueOf() == typeof m.valueOf() && Numeric.isInt(n) && Numeric.isInt(m) && m && !(n % m)};

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
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
   if (n < 0n) throw new RangeError('return value is NaN');
   let i = 1n;
   while (n >> i) {n ^= n >> i; i <<= 1n}
   return !!(n & 1n)
};

Math.popcnt32 = function(i)
{//stackoverflow.com/a/109025
   i |= 0; //maybe `>>>=` is correct
   i -= (i >>> 1) & 0x55555555;
   const m = 0x33333333;
   i = (i & m) + ((i >>> 2) & m);
   i = (i + (i >>> 4)) & 0x0F0F0F0F;
   return Math.imul(i, 0x01010101) >>> 24;
};

BigInt.popcnt = function(n)
{
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
   if (n < 2n) {if (n < 0n) {throw new RangeError('return value is Infinity')} else return n}
   //this algorithm works best with less zeros
   n >>= BigInt.ctz(n);
   if (n == 1n) return n;
   let c = 0n, w = new BigUint64Array(1); //correctness and performance
   const m = 0x3333333333333333n;
   do {
      w[0] = n; //copy least significant Q-word
      n >>= 64n; //release memory ASAP
      //en.wikipedia.org/wiki/Hamming_weight#Efficient_implementation
      w[0] -= (w[0] >> 1n) & 0x5555555555555555n;
      w[0] = (w[0] & m) + ((w[0] >> 2n) & m);
      w[0] = (w[0] + (w[0] >> 4n)) & 0x0f0f0f0f0f0f0f0fn;
      w[0] *= 0x0101010101010101n;
      //splitted, to emulate overflow mod 2^64
      c += w[0] >> 56n;
   } while (n);
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

//32bit Hamming Distance
Math.Hdist32 = function(a, b) {return Math.popcnt32(a ^ b)};

BigInt.Hdist = function(a, b) {return BigInt.popcnt(a ^ b)};

Numeric.Hdist = function(a, b)
{
   a = Numeric.to(a); b = Numeric.to(b);
   if (typeof a.valueOf() != typeof b.valueOf()) throw new TypeError(['Arguments are not same-type', a, b]);
   if (BigInt.is(a)) return BigInt.Hdist(a, b);
   if (!isFinite(a) || !isFinite(b)) return NaN;
   const t = Math.trunc;
   a = t(a); b = t(b);
   const w = 2 ** 32, z = 2 ** Math.min(Numeric.ctz(a), Numeric.ctz(b));
   a /= z; b /= z;
   let c = 0;
   while (a || b)
   {
      c += Math.Hdist32(a, b)
      a = t(a / w);
      b = t(b / w);
   }
   return c
};

Math.isSquare = function(n)
{
   n = +n;
   if (!Number.isInteger(n)) return false;
   if (n < 2) return n >= 0;
   //stackoverflow.com/a/18686659
   if (BigInt.asIntN(64, 0x840C04048404040n << BigInt(n)) >= 0n) return false;
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
   if (BigInt.asIntN(64, 0x840C04048404040n << n) >= 0n) return false;
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

BigInt.sizeOf = function(n, b = 8n)
{//b is the unit of measurement. 1: bit, 8: Byte, 16: word, 32: D-word, 64: Q-word
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
   n = BigInt.abs(n); b = BigInt.abs(BigInt(b)); //exclude sign bit
   if (!b) throw new RangeError('return value is Infinity');
   let i = 1n; //size cannot be 0
   while (n >>= b) i++;
   return i
};

BigInt.log2 = function(n) //lb(bigint)
{
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
   if (n <= 0n) throw new RangeError('return value is -Infinity or NaN');
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
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
   b = BigInt(b); //throw error if cannot coerce
   if (b <= 1n) throw new RangeError('return value is -Infinity or NaN');
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
   if (typeof x.valueOf() != typeof b.valueOf()) throw new TypeError(['Arguments are not same-type', x, b]);
   if (b <= 1) return NaN;
   return (BigInt.is(x) ? BigInt : Math).logB(x, b)
};

let logStar = (x, b = 2) => {
   x = Numeric.to(x); b = Numeric.to(b);
   if (typeof x.valueOf() != typeof b.valueOf()) throw new TypeError(['Arguments are not same-type', x, b]);
   let i = 0;
   while (x > 1n) {x = Numeric.logB(x, b); i++}
   return i
};

Math.root = function(x, n = 2) {return Math.pow(x, 1 / n)};

BigInt.root = function(n, i = 2n)
{//ith (degree i) root of n
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
   i = BigInt(i);
   if (i === 1n) return n;
   n = Numeric.signSplit(n);
   if (!i) {if (n[1] > 1n) {throw new RangeError('return value is NaN')} else return 0n}
   if (n[0] === -1n && !(i & 1n)) throw new RangeError('return value is Complex number');
   if (i < 0n) {if (n[1]) {return n[1] === 1n ? n[0] : 0n} else throw new RangeError('return value is Infinity')}
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
   if (!BigInt.is(n)) throw new TypeError(['Expected BigInt', n]);
   if (n < 2n) {if (n < 0n) {throw new RangeError('return value is Complex number')} else return n}
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
   if (typeof x.valueOf() != typeof n.valueOf()) throw new TypeError(['Arguments are not same-type', x, n]);
   if (x !== x || n !== n) return NaN;
   const a = Numeric.abs(x), zero = x ^ x;
   if (!n) return a > 1n ? NaN : zero;
   if (x < 0 && (BigInt.is(n) && !(n & 1n))) return NaN;
   if (n < 0) return a ? (a == 1 ? Numeric.sign(x) : zero) : Infinity;
   if (!a) return zero;
   return (BigInt.is(x) ? BigInt : Math).root(x, n)
};

Numeric.sqrt = function(x)
{
   x = Numeric.to(x);
   return x < 0 ? NaN : (BigInt.is(x) ? BigInt : Math).sqrt(x)
};

Math.gcd = function(a, b)
{//Euclidean
   a = +a; b = +b;
   if (a !== a || b !== b) return NaN;
   while (b) [a, b] = [b, a % b];
   return a
};

BigInt.gcd = function(a, b)
{
   if (!(BigInt.is(a) && BigInt.is(b))) throw new TypeError(['Expected BigInts', a, b]);
   //Stein's Binary, because I don't understand Lehmer's
   if (!a) return b; if (!b) return a;
   const ctz = BigInt.ctz,
      i = ctz(a), j = ctz(b), k = BigInt.min(i, j);
   a >>= i; b >>= j;
   while (1)
   {
      if (a > b) [a, b] = [b, a];
      b -= a;
      if (!b) return a << k;
      b >>= ctz(b)
   }
};

//returns correct values when inputs are rational numbers
//whose denominators are any power of 2 (including 2**0)
Numeric.gcd = function(a, b)
{
   a = Numeric.abs(a); b = Numeric.abs(b); //avoids tail-calling Numeric.to and Numeric.abs
   if (typeof a.valueOf() != typeof b.valueOf()) throw new TypeError(['Arguments are not same-type', a, b]);
   if (BigInt.is(a)) return BigInt.gcd(a, b);
   return Math.gcd(a, b);
};

Numeric.lcm = function(a, b)
{
   //calling early allows optimization
   a = Numeric.abs(a); b = Numeric.abs(b);
   return a / Numeric.gcd(a, b) * b
   //better performance and lower overflow probability
   //than `a * b / Numeric.gcd(a, b)`
};

//2nd lowest common divisor
//the 1st is always 1
let lcd = (a, b) => {
   a = Numeric.abs(a); b = Numeric.abs(b);
   const ab = a * b, rt = Numeric.sqrt(ab), u = BigInt.is(a) ? 1n : 1;
   for (let i = u + u; i <= rt; i++)
      {if (!(ab % i)) return i}
   return u
};

//Arithmetic-Geometric Mean
Numeric.agm = function(a, g)
{
   a = Numeric.to(a); g = Numeric.to(g);
   if (a !== a || g !== g || a < 0 || g < 0) return NaN;
   if (!(a && b)) return 0;
   if (a === b) return a;
   if (BigInt.is(a))
   {
      do [a, g] = [(a + g) / 2n, BigInt.sqrt(a * g)]
      while (a !== g)
   }
   else
   {
      let x;
      do [a, g, x] = [(a + g) / 2, Math.sqrt(a * g), a]
      while (a !== x)
      //this condition allows max precision
      //and prevents infinite loops caused by rounding errors
   }
   return a
};

let Leyland = (x, y) => x ** y + y ** x;

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

function factorize(n) //get prime factorization of n
{
   n = Math.trunc(Math.abs(Number(n))); //pseudo BigInt support
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

//factorial approximation for non-integers
let fact_approx = x => Math.sqrt((x + 1 / 6) * Math.TAU) * (x / Math.E) ** x;
//Gosper's. because Stirling's crappy

//Gamma Function defined as Summation instead of Integration
let gamma = x => {
   x -= 1; //`x = +x` for better fact approx
   let t = 1, s0, s1 = 0 ** x;
   //0 ** 0 === 1
   do {s0 = s1; s1 += t ** x * Math.exp(-t); t++} while (s0 !== s1);
   return s0
};

//only used for accuracy testing purposes
var fact = x => (fact_approx(x) + gamma(x + 1)) / 2;

//co-recursive Fact
Numeric.factorial = function(x, k = 1)
{//if k > 1 returns multifactorial of that degre
   x = Numeric.signSplit(x);
   k = Numeric.to(k);
   if (!BigInt.is(k)) k = Math.trunc(k);
   k = x[0] * k; x = x[1];
   const out = [BigInt.is(x) ? 1n : 1];
   for (let i = k; out.length <= x; i += k) out.push(i * out.at(-1));
   //this algorithm isn't good for BigInts.
   //these are better: http://www.luschny.de/math/factorial/FastFactorialFunctions.htm
   return out
};

//iterative inverse Fact
Numeric.factorial_inv = function(n, k = 1)
{//if k > 1 returns corresponding inv multifactorial
   n = Numeric.to(n); k = Numeric.to(k);
   if (!n || k !== k) return NaN;
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
let triNum = x => BigInt.is(x) ? x * (x + 1n) / 2n : x * (x + 1) / 2;

//get index of a trinum
let triNum_inv = x => BigInt.is(x) ? (BigInt.sqrt((x << 3n) + 1n) - 1n) >> 1n : (Math.sqrt(8 * x + 1) - 1) / 2;

//get TriNums up to index x (inclusive)
let triSeq = x => {
   x = Numeric.signSplit(x); const out = [x ^ x]; //0n if bigint, else float 0
   for (let i = x[0]; out.length <= x[1]; i += x[0]) out.push(i + out.at(-1));
   return out
};

//en.wikipedia.org/wiki/Polygonal_number
//missing BigInt support
let ppn = (i, s = 3) => ((s - 2) * i*i - (s - 4) * i) / 2;
//get ith polygonal num with s sides
let ipn = (p, s = 3) => (Math.sqrt(8 * (s - 2) * p + (s - 4) ** 2) + (s - 4)) / (2 * (s - 2));
//indexOf polyg num p with s sides
let spn = (p, i = 2) => 2 + (2 / i) * ((p - i) / (i - 1));
//get sides of p whose index is i

//get Nth Fibonacci faster than recursion
let Fib = n => {
   n = Numeric.signSplit(n);
   return Math.round(Math.PHI ** n[1] / Math.SQRT5) * (n[0] === -1 && n[1] % 2 === 0 ? -1 : 1)
};
//en.wikipedia.org/wiki/Generalizations_of_Fibonacci_numbers#Extension_to_negative_integers

//get index of a Fib num
let Fib_inv = F => {
   F = Numeric.signSplit(F);
   const i = Math.floor(Math.logPHI(F[1] * Math.SQRT5 + 0.5))
   return !(i % 2) && F[0] === -1 ? NaN : i * F[0]
};

//en.wikipedia.org/wiki/Lucas_sequence
//co-recursive Lucas function
//If F is falsy (default) then "U", else "V"
let Lucas = (n, P = 1, Q = -1, F) => {
   const seq = BigInt.is(P) && BigInt.is(Q) ? (F ? [2n, P] : [0n, 1n]) : (F ? [2, P] : [0, 1]);
   while (seq.length <= n) seq.push(P * seq.at(-1) - Q * seq.at(-2));
   return seq
};

//TO-DO: insert Dot-Product here


//generalized Collatz
//en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations
function Collatz_gen(n, k = 2, a=[[1, 2], [3, 1]], b=[[0, 1], [1, 1]], P = 2)
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
}

/*
Returns (Hailstone) seq of n. Supports signed integers.
You can explicitly specify the k steps, or let it detect known cycles.
Falsy s: Standard
Truthy s: "Shortcut" version
"Shortcut" is like Standard but skips some Even numbers
en.wikipedia.org/wiki/Collatz_conjecture
*/
function Collatz_std(n, k, s)
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
}

//generalized Van Eck seq.
//the algorithm has been optimized for speed and memory usage
//uses a Map to avoid linear search
function* VanEck(seed = 0, pad = 0){//padding
   if (!BigInt.is(seed)) seed = Number(seed);
   if (!BigInt.is(pad)) pad = Number(pad);
   seed = Numeric.abs(seed); pad = Numeric.abs(pad);
   seed = Numeric.abs(seed); pad = Numeric.abs(pad);
   let M = []; /*
   Array can be used instead of Map
   because the growth rate is linear
   and there's a conjecture that states
   all natural numbers appear in the sequence,
   so the undefined slots will eventually be filled
   while more gaps are created simultaneously
   */
   const u = BigInt.is(pad) ? 1n : 1; //inclusive unit
   let len = u, pre = NaN;
   //length of sequence, and value before seed, respectively
   while (1)
   {
      yield pre = seed;
      seed = M[pre] !== undefined ? len - u - M[pre] : pad;
      M[pre] = ++len - u - u
   }
};

//co-recursive algorithm to compute Golomb's seq
//up to and including index n
function Golomb(n)
{
   const G = [NaN, 1];
   n = Number(n);
   while (n >= G.length)
      G.push(1 + G[G.length - G[G.at(-1)]]);
   return G
}

let Ackermann = {};
//memoization
Ackermann.m = Array(12).fill([]); //enough arrays for any value of "m"
Ackermann.f = function(m, n)
{
   m = Numeric.to(m);
   if (!BigInt.is(n)) n = BigInt(Math.trunc(n));
   if (!isFinite(m)) return NaN;
   n = Numeric.signSplit(n); //support for negatives
   while (m > 3) //removed tail-call
   {
      if (n[1] === 0n) n[1] = 1n
      else
      {
         if (Ackermann.m[m][n[1]]) return Ackermann.m[m][n[1]];
         n[1]--;
         Ackermann.m[m][n[1]] ||= Ackermann.f(m, n[1]);
         n[1] = Ackermann.m[m][n[1]]
      };
      m--
   };
   return [n[1] + 1n, n[1] + 2n, (n[1] << 1n) + 3n, (1n << (n[1] + 3n)) - 3n][m] * n[0]
   //better than `switch` in this case lol
}

//"Inverse" Ackermann function
function ack_inv(m, n)
{
   let i = 1, x = 0;
   while (x < Math.log2(n)) x = Ackermann.f(i++, m / n);
   return x
}

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
let toNumeral = function(N, B) {const dig = []; while (N > 0) {dig.push(N % B); N = N / B - N % B}; return dig.reverse().join('')};
//for performance I avoided using unshift(), reverse() should be faster

//parses a numeral in base B and returns its value
let parseNumeral = function(numeral, B) {let n = 0; for (d of numeral) {n = b * n + d}; return n};

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
      if (!b) throw new RangeError('return value is Infinity');
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

//correction of data descriptors
//to make it similar to vanilla JS
for (const O of [Number, Math, BigInt, Numeric])
{
   //`=` operator is enumerable by default
   //and all these objects (except `Numeric`) have no enumerable properties by default
   //thus, getting the keys returns all the custom property names
   for (const k of Object.keys(O))
      Object.defineProperty(O, k, typeof O[k] == 'function' ? {enumerable: false} : {writable: false, enumerable: false, configurable: false});
}
