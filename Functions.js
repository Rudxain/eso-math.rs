'use strict';

//I'll probably use this
const assert = function(c, m, e = Error) {if (!c) throw new e(m)};

//`at` method is too new
//github.com/tc39/proposal-relative-indexing-method#polyfill
function at(n)
{  //modified to support BigInt
   n = Math.trunc(Number(n)) || 0; if (n < 0) n += this.length;
   return n < 0 || n >= this.length ? undefined : this[n]
   //I know someArray[someBigInt] works, but using Number() is shorter than if/else
};
const TypedArray = Reflect.getPrototypeOf(Int8Array);
for (const C of [Array, String, TypedArray])
   Object.defineProperty(C.prototype, "at",
      {value: at, writable: true, enumerable: false, configurable: true});

const isBigInt = x => typeof x === 'bigint';
const isNumerical = x => typeof x === 'number' || isBigInt(x);

const toNumerical = x => {
   if (isNumerical(x)) return x;
   return(
      !(Math.abs(x) > Number.MAX_SAFE_INTEGER) || (typeof x === 'string' && /\s*?-?Infinity\s*?/.test(x))
         ? +x : BigInt(x) )
};

const isInt = x => Number.isInteger(x) || isBigInt(x);

//docs.oracle.com/javase/7/docs/api/java/lang/Double.html#MIN_NORMAL
Number.MIN_NORMAL = Math.pow(2, -1022);

Math.TAU = 2 * Math.PI;

Math.SQRT5 = Math.sqrt(5);

//Golden Ratio
Math.PHI = Math.SQRT5 / 2 + 0.5; //this doesn't require parentheses haha

//the 2nd solution to x**2 - x == 1
Math.PSI = 1 - Math.PHI //simple and accurate
//(1 - sqrt(5)) / 2 === 1 - phi && 0.5 - sqrt(5) / 2 === psi
//`-1 / phi` is prone to rounding error, and it's slower to compute

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

Math.degToRad = function(d) {return d * (Math.PI / 180)};
Math.radToDeg = function(r) {return r / (Math.PI / 180)};

//for consistency, no static method will be an arrow function
BigInt.sign = function(n)
{
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   return n && (n < 0n ? -1n : 1n)
};
BigInt.abs = function(n)
{
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   return n < 0n ? -n : n
};

const anySign = x => (isBigInt(x = toNumerical(x)) ? BigInt : Math).sign(x);

const anyAbs = x => (isBigInt(x = toNumerical(x)) ? BigInt : Math).abs(x);

const signSplit = x => [anySign(x), anyAbs(x)]; //should be reversed order

BigInt.max = function(...arg)
{
   if (!arg.every(isBigInt)) throw new TypeError(['Some arguments are not BigInt', arg]);
   return arg.reduce((m, n) => n > m ? n : m)
};
BigInt.min = function(...arg)
{
   if (!arg.every(isBigInt)) throw new TypeError(['Some arguments are not BigInt', arg]);
   return arg.reduce((m, n) => n < m ? n : m)
};

const anyMax = (...arg) => arg.map(toNumerical).reduce((m, n) => n > m ? n : m);
//sort is slow, but it's correct
const anyMin = (...arg) => arg.map(toNumerical).reduce((m, n) => n < m ? n : m);

//negative r: floor
//positive r: ceil
//falsy r: round
//Euclidean is missing, I'll add it later
//n and d are dividend and divisor respectively
BigInt.div = function(n, d, r)
{
   if (!isBigInt(n) || !isBigInt(d)) throw new TypeError(['Expected BigInts', n, d]);
   return (r ?
      n / d + (n % d !== 0n ? BigInt.sign(BigInt(r)) : 0n)
      : ((n < 0n) !== (d < 0n) ? n - d / 2n : n + d / 2n) / d
   )
};

//inspired by the division instruction in ISAs
const CPU_DIV = (n, d) => {
   if (isBigInt(n) && isBigInt(d)) return [n / d, n % d];
   const t = Math.trunc;
   [n, d] = [t(n), t(d)];
   return [t(n / d), n % d]
};

//modulo. NOT remainder
function mod(a, n) {return (a % n + n) % n};
//the other definitions are missing (types of div)

Math.mod = function(a, n) {return mod(+a, +n)};
//Math is racist against BigInt, but accepts everyone else

BigInt.mod = function(a, n)
{//BigInt is purist, rejects everyone except its own kind
   if (!isBigInt(a) || !isBigInt(n)) throw new TypeError(['Expected BigInts', a, n]);
   return mod(a, n)
};

/*
The "any" family accepts everyone as they are.
And if they aren't numerical, "any" helps them find their best fitting form
such that they are comfortables with themselves.
*/
const anyMod = (a, n) => mod(toNumerical(a), toNumerical(n));
//in a nutshell, you've learned the differences between methods of different objects

BigInt.ctrz = function(n) //count trailing zeros
{//the name "ctrz" is preferred over "ctz" in the MDN
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   if (!n) throw new RangeError('return value is Infinity');
   const b = 0x80n; //optimized for 64bit CPUs. 0x40n is better for 32bit
   let i = 0n;
   while (!(n & ((1n << b) - 1n))) {n >>= b; i += b}; //loop unrolling
   while (!(n & 1n)) {n >>= 1n; i++}; //TO-DO: replace with binary search
   return i
};

BigInt.sizeOf = function(n, b = 8n)
{//b is the unit of measurement. 1: bit, 8: Byte, 16: word, 32: Dword, 64: Qword
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   [n, b] = [BigInt.abs(n), BigInt.abs(BigInt(b))];
   let i = 1n; //size cannot be 0
   while (n >>= b) i++;
   return i
};

BigInt.log2 = function(n) //lb(bigint)
{
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   if (n <= 0n) throw new RangeError('return value is -Infinity or NaN');
   let b = 2n;
   let i = 0n;
   while (n >= (1n << b)) {n >>= b; i += b; b <<= 1n}; //exponential loop unrolling
   while (n > 1n) {n >>= 1n; i++};
   return i
};

BigInt.logB = function(n, b = 3n)
{
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   b = BigInt(b);
   if (n <= 0n || b <= 1n) throw new RangeError('return value is -Infinity or NaN');

   const d = BigInt.log2(n) - 52n;
   if (d > 0n) n >>= d;
   b = Number(b);
   return BigInt(Math.trunc(Math.logB(Number(n), b) + (d > 0n && (Number(d) * Math.logB(2, b)))));
   /*
   //TO-DO: try `BigInt.log2(b) + 1n`
   let i = BigInt.log2(n) / BigInt.log2(b); n /= b ** i;
   while (n > 1n) {n /= b; i++}
   return i
   //only works in base 2
   //slightly off in other bases
   */
};

const anyLogB = (x, b = 2) => {
   [x, b] = [toNumerical(x), toNumerical(b)];
   if (typeof x !== typeof b) throw new TypeError(['Arguments are not same-type', x, b]);
   return (isBigInt(x) ? BigInt : Math).logB(x, b)
};

const logStar = (x, b = 2) => {
   [x, b] = [toNumerical(x), toNumerical(b)];
   if (typeof x !== typeof b) throw new TypeError(['Arguments are not same-type', x, b]);
   let i = 0;
   while (x > 1n) [x, i] = [anyLogB(x, b), i + 1];
   return i
};

Math.root = function(x, n=2) {return Math.pow(x, 1 / n)};

BigInt.root = function(n, i = 2n)
{//ith (degree i) root of n
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   i = BigInt(i);
   if (i === 1n) return n;
   n = signSplit(n);
   if (!i) {if (n[1] > 1n) {throw new RangeError('return value is NaN')} else return 0n}
   if (n[0] === -1n && (i & 1n) === 0n) throw new RangeError('return value is Complex type');
   if (i < 0n) {if (n[1]) {return n[1] === 1n ? n[0] : 0n} else throw new RangeError('return value is Infinity')}
   if (!n[1]) return 0n;
   const j = i - 1n;
   //a ^ (1 / k) = b ^ (log_b(a) / k)
   let x0 = 2n << BigInt.log2(n[1]) / i, x1 = x0 * j / i + n[1] / (i * x0 ** j);
   while (x1 < x0)
      [x0, x1] = [x1, x1 * j / i + n[1] / (i * x1 ** j)];
   return x0 * n[0]
};

BigInt.sqrt = function(n)
{//Heron's Method
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   if (n < 2n) {if (n < 0n) {throw new RangeError('return value is Complex type')} else return n}
   let x0 = 2n << (BigInt.log2(n) >> 1n), x1 = (x0 + n / x0) >> 1n;
   while (x1 < x0)
      [x0, x1] = [x1, (x1 + n / x1) >> 1n];
   return x0;
};

const anyRoot = (x, n) => {
   [x, n] = [toNumerical(x), toNumerical(n)];
   if (typeof x !== typeof n) throw new TypeError(['Arguments are not same-type', x, n]);
   return (isBigInt(x) ? BigInt : Math).root(x, n)
};

const anySqrt = x => (isBigInt(x = toNumerical(x)) ? BigInt : Math).sqrt(x);

//returns correct values when inputs are rational numbers
//whose denominators are any power of 2 (including 2**0)
const gcd = (a, b) => {
   //avoids tail-calling toNumerical twice and anyAbs once
   [a, b] = [anyAbs(a), anyAbs(b)];
   if (typeof a !== typeof b) throw new TypeError(['Arguments are not same-type', a, b]);
   if (isBigInt(a))
   {//Stein's Binary, because I don't understand Lehmer's
      if (!a) return b; if (!b) return a;
    //if (!(a && b)) return BigInt.max(a, b);
      const i = BigInt.ctrz(a); a >>= i;
      const j = BigInt.ctrz(b); b >>= j;
      const k = BigInt.min(i, j);
      while (true)
      {
         if (a > b) [a, b] = [b, a];
         b -= a;
         if (!b) return a << k;
         b >>= BigInt.ctrz(b);
      }
   }
   else
   {//Euclidean
      if (a !== a || b !== b) return NaN; //`!==` is better than `Number.isNaN()`
      while (b) [a, b] = [b, a % b];
      return a
   }
};

const lcm = (a, b) => {
   //calling early probably allows removal of redundant calls in gcd
   [a, b] = [anyAbs(a), anyAbs(b)];
   return a / gcd(a, b) * b /*this ensures performance and low overflow probability
   when compared to `a * b / gcd(a, b)`*/
};

//Arithmetic-Geometric Mean
const agm = (a, g) => {
   [a, g] = [Number(a), Number(g)]; //BigInt pseudo-support
   if (a !== a || g !== g) return NaN; //prevent infinite loop
   let x;
   do [x, a, g] = [a, (a + g) / 2, Math.sqrt(a * g)]
   while (a !== x);
   //this condition allows max precision and prevents infinite loops caused by rounding errors
   return x
};

const isDivisible = (n, m) => typeof n === typeof m && isInt(n) && isInt(m) && !(n % m);

const isSquare = n => {
   if (n < 0) return false;
   if (typeof n === 'number') return Number.isInteger(Math.sqrt(n));
   //stackoverflow.com/a/18686659
   if (!isBigInt(n) || BigInt.asIntN(64, 0xC840C04048404040n << n) >= 0n) return false;
   if (n < 2n) return true; //prevent ctz error, and return early
   const ctz = BigInt.ctrz(n);
   if (ctz & 1n) return false;
   n >>= ctz;
   if ((n & 7n) !== 1n) return false;
   return BigInt.sqrt(n) ** 2n === n
};

BigInt.isPow2 = function(n)
{
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   return n > 0n && !(n & (n - 1n))
};
//0 isn't a power of 2, nor a Mersenne number,
//that's why `!!n &&` is neccessary
BigInt.isMersenne = function(n)
{
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   return n > 0n && !(n & (n + 1n))
};

BigInt.bitParity = function(n)
{
   if (!isBigInt(n)) throw new TypeError(['Expected BigInt', n]);
   let i = 1n;
   while (n >> i) {n ^= n >> i; i <<= 1n}
   return n & 1n
};

//returns non-trivial divisors (proper divs) of n
const divisors = n => {
   n = toNumerical(n);
   const out = []; let m, i;
   if (isBigInt(n))
      {n = BigInt.abs(n); m = BigInt.sqrt(n); i = 2n}
   else
      {n = Math.abs(n); m = Math.sqrt(n); i = 2};
   while (i <= m) {if (isDivisible(n, i)) out.push(i); i++};
   i = out.length - isSquare(n) - 1;
   while (i >= 0) out.push(n / out[i--]);
   return out
};

const Pa = [2, 3, 5]; //array of sorted Primes, no gaps (dense)
const Pd = new Set(Pa); //Primality "dictionary", any order, gaps allowed (sparse)
const addP = function()
{
   let x = Pa.at(-1) + 2;
   test:
   for (let y = Math.sqrt(x), j; true; x += 2, y = Math.sqrt(x))
   {
      if (Pd.has(x)) break;
      if (y === Math.trunc(y)) continue; //ignore perfect squares because they are composite
      j = 1;
      while (Pa[j] <= y) if (x % Pa[j++] === 0) continue test;;
      Pd.add(x); break;
   }
   Pa.push(x)
};

const Pfactor = function(n) //get prime factorization of n
{
   n = Math.trunc(Math.abs(Number(n)));
   if (n !== n || n === Infinity) return; //returning NaN or [] doesn't make sense, undefined is "more correct"
   let [rt, y] = [1, Math.sqrt(n)];
   while (y === Math.trunc(y)) [n, y, rt] = [y, Math.sqrt(y), rt * 2];
   let [m, i] = [n, 0]; const out = new Map;
   while (Pa[i] <= y && Pa[i] <= m && !Pd.has(m)) //trust me, all 3 are necessary for speed
   {
      while (m % Pa[i] === 0) {m /= Pa[i]; out.set(Pa[i], (out.get(Pa[i]) || 0) + rt)}
      if (i++ >= Pa.length) addP(); //Primes on-demand
   }
   if (m > 1) {out.set(m, (out.get(m) || 0) + rt); Pd.add(m)}
   return out
};

//factorial approximation for non-integers
const Stirling = x => Math.sqrt(Math.TAU * x) * (x / Math.E) ** x;

//co-recursive Fact with support for any number (except BigInt and Imaginary)
const Factorial = x => {
   x = signSplit(x); const out = [isBigInt(x) ? 1n : 1];;
   for (let i = x[0]; out.length <= x[1]; i += x[0]) out.push(i * out.at(-1));
   //this algorithm isn't good for BigInts.
   //See: http://www.luschny.de/math/factorial/FastFactorialFunctions.htm
   return out
};

//iterative inverse Fact. If k > 1 returns corresponding inv multifactorial
const Factorial_inv = (n, k = 1) => {
   if (!n) return NaN;
   let x = Math.sign(n);
   while (Math.abs(n) > 1) {x += k; n /= x};
   return x
};

//"Termial/Additorial/Sumatorial" Fs
//en.wikipedia.org/wiki/Triangular_number ; en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF

//get Nth "TriNumber" fast
const triNum = x => isBigInt(x) ? x * (x + 1n) / 2n : x * (x + 1) / 2;

//get index of a trinum
const triNum_inv = x => isBigInt(x) ? (BigInt.sqrt((x << 3n) + 1n) - 1n) >> 1n : (Math.sqrt(8 * x + 1) - 1) / 2;

//get TriNums up to index x (inclusive)
const triSeq = x => {
   x = signSplit(x); const out = [x ^ x]; //0n if bigint, else float 0
   for (let i = x[0]; out.length <= x[1]; i += x[0]) out.push(i + out.at(-1));
   return out
};

//en.wikipedia.org/wiki/Polygonal_number
//missing BigInt support
const ppn = (i, s=3) => ((s - 2) * i*i - (s - 4) * i) / 2;
//get ith polygonal num with s sides
const ipn = (p, s=3) => (Math.sqrt(8 * (s - 2) * p + (s - 4) ** 2) + (s - 4)) / (2 * (s - 2));
//indexOf polyg num p with s sides
const spn = (p, i=2) => 2 + (2 / i) * ((p - i) / (i - 1));
//get sides of p whose index is i

const Leyland = (x, y) => x ** y + y ** x;

//get Nth Fibonacci faster than recursion
const Fib = n => {
   n = signSplit(n);
   return Math.round(Math.PHI ** n[1] / Math.SQRT5) * (n[0] === -1 && n[1] % 2 === 0 ? -1 : 1)
};
//en.wikipedia.org/wiki/Generalizations_of_Fibonacci_numbers#Extension_to_negative_integers

//get index of a Fib num
const Fib_inv = F => {
   F = signSplit(F);
   const i = Math.floor(Math.logPHI(F[1] * Math.SQRT5 + 0.5))
   return i % 2 !== 0 && F[0] === -1 ? NaN : i * F[0]
};

//en.wikipedia.org/wiki/Lucas_sequence
//co-recursive Lucas function
//If F is falsy (default) then "U", else "V"
const Lucas = (n, P = 1, Q = -1, F) => {
   const seq = isBigInt(P) && isBigInt(Q) ? (F ? [2n, P] : [0n, 1n]) : (F ? [2, P] : [0, 1]);
   while (seq.length <= n) seq.push(P * seq.at(-1) - Q * seq.at(-2));
   return seq
};

const addFrac = (f0 = [0, 1], f1 = [0, 1]) => {
   //format is [num, den]
   let out = [null, lcm(f0[1], f1[1])];
   out[0] = out[1] / f0[1] * f0[0] + out[1] / f1[1] * f1[0];
   return out
};

//generalized Collatz
//en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations
const Collatz_gen = (n, k=2, a=[[1, 2], [3, 1]], b=[[0, 1], [1, 1]], P=2) => {
   n = toNumerical(n);
   if (n !== n) return;//if NaN then undefined. `[]` is wrong
   [k, P] = [Number(k), Math.trunc(P)];
   const seq = [n]; let i, tmp;
   while (seq.length < k)
   {
      i = seq.at(-1) % P;
      tmp = addFrac([seq.at(-1) * a.at(i)[0] / a.at(i)[1], 1], b.at(i));
      seq.push(tmp[0] / tmp[1])
   };
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
const Collatz_std = (n, k, s) => {
   k = Number(k); const h = [];
   if (isBigInt(n))
   {
      h.push(n);
      const c = new Set([0n, 1n, -1n, -5n, -17n]);
      while (k ? h.length < k : !c.has(h.at(-1)))
         h.push(h.at(-1) % 2n ? (3n * h.at(-1) + 1n) / (s ? 2n : 1n) : h.at(-1) / 2n);
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

//generalized Van Eck seq.
//the algorithm has been optimized to avoid searches by using more memory
const VanEck_custom = function(n, seed = 0n, pad = 0n)
{
   const [VE, last] = [[seed], new Map];
   while (VE.length <= n)
   {
      VE.push(last.has(VE.at(-1)) ? VE.length - 1 - last.get(VE.at(-1)) : pad)
      last.set(VE.at(-2), VE.length - 2)
   }
   return VE.slice(1) //removes redundancy
};

//co-recursive algorithm to compute Golomb's seq
//up to and including index n
const Golomb = function(n)
{
   const G = [NaN, 1];
   while (n >= G.length)
      G.push(1 + G[G.length - G[G.at(-1)]]);
   return G
};

//memoization
let Ack_mem = [[],[],[],[],[],[],[],[]]; //enough arrays for any value of "m"
const Ackermann = function(m, n)
{
   [m, n] = [Math.trunc(m), BigInt(n)];
   if (m !== m) return NaN;
   n = signSplit(n); //support for negatives
   while (m > 3)
   {
      if (n[1] === 0n) n[1] = 1n
      else
      {
         if (Ack_mem[m][n[1]]) return Ack_mem[m][n[1]];
         n[1]--;
         Ack_mem[m][n[1]] ||= Ackermann(m, n[1]);
         n[1] = Ack_mem[m][n[1]]
      };
      m--
   };
   return n[0] * [n[1] + 1n, n[1] + 2n, (n[1] << 1n) + 3n, (1n << (n[1] + 3n)) - 3n][m] //better than switch in this case lol
};

//"Inverse" Ackermann function
const ack_inv = function(m, n)
{
   let [i, x] = [1, 0];
   while (x < Math.log2(n))
      {x = Ackermann(i, m / n); i++};
   return x
};

/*
The following are all Work In Progress:

//Division by repeated subtraction, but the divisor gets decremented each iteration
function decayDiv(n, d)
{
   [n, d] = [singSplit(n), singSplit(d)];
   let i = isBigInt(n[0]) ? 0n : 0;
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
   let i = isBigInt(m[0]) ? 0n : 0, x = f[1];
   while (i < m[1])
      {x += f[1]; m[1]--; i++}
   return [n[0] * i, n[0] * n[1], d[0] * d[1]]
}

//"multiplicand" (factor) gets decremented
function decayMult1(f, m)
{
   
}

//Converts a number N into a numeral of base B using an alternative algorithm
const toNumeralAlt = function(N, B, 
charset=[`0`,`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`,`9`,`a`,`b`,`c`,`d`,`e`,`f`,`g`,`h`,`i`,`j`,`k`,`l`,`m`,`n`,`o`,`p`,`q`,`r`,`s`,`t`,`u`,`v`,`w`,`x`,`y`,`z`,`A`,`B`,`C`,`D`,`E`,`F`,`G`,`H`,`I`,`J`,`K`,`L`,`M`,`N`,`O`,`P`,`Q`,`R`,`S`,`T`,`U`,`V`,`W`,`X`,`Y`,`Z`])
{ 
   const out = [];
   for (let i=0; i < (B != 1 ? Math.floor(Math.logB(N, B)) + 1 : N); i++)
      out.push(charset[B > 1 ? (N % B**(i+1) - N % B**i) / B**i : 1]);
   return out.reverse().join('')
};

//returns the digit at index i of a numeral in base/radix B, with numeric value N
const getDigit = (N, B, i) => Math.trunc(N / B**i) % B;

//prints a Natural number n to its corresponding numeral in base B
const toNumeral = function(N, B) {const dig = []; while (N > 0) {dig.push(N % B); N = N / B - N % B}; return dig.reverse().join('')};
//for performance I avoided using unshift(), reverse() should be faster

//parses a numeral in base B and returns its value
const parseNumeral = function(numeral, B) {let n=0; for (d of numeral) {n = b * n + d}; return n};

//convert the digits representation of a number from a base/radix to another
const B2B = (numeral, inpB, outB) => toNumeral(parseNumeral(numeral, inpB), outB);

//en.wikipedia.org/wiki/Digital_root#Congruence_formula
function dig_rt_c(n, b)
{
   return (
      isBigInt(n) && isBigInt(b) ?
      (n && ((n - 1n) % (b - 1n) + 1n) : 0n)
      :
      (n !== 0 ? ((n - 1) % (b - 1) + 1) : 0)
   )
};

//en.wikipedia.org/wiki/Digital_root
const dig_sum = function(x, b)
{
   if (isBigInt(x) && isBigInt(b))
   {
      var sum = 0n;
      while (x) {sum += x % b; x /= b)};
   };
   else
   {
      [x, b] = [+x, +b];
      if (!Number.isFinite(x)) return x;
      if (!Number.isFinite(b) || b === 0) return x / b;
      var sum = 0;
      while (x !== 0) {sum += x % b; x = Math.trunc(x / b)};
   };
   return sum
};

//persistence == seen.length - 1
const dig_rt_a = function(x, b)
{
   const seen = new Set;
   while (!seen.has(x)) {seen.add(x); x = dig_sum(x, b)};
   console.log(seen) //DEBUG
   return x
};

//en.wikipedia.org/wiki/Multiplicative_digital_root
const dig_prod = function(x, b)
{
   [x, b] = [Math.trunc(x), Math.trunc(b)]
   let prod = 1, mod;
   while (x > 1)
   {
      mod = x % b;
      if (mod === 0) return 0;
      if (Math.abs(mod) !== 1) prod *= mod;
      x = Math.trunc(x / b)
   };
   return prod
};

const dig_rt_m = function(x, b)
{
   const seen = new Set;
   while (!seen.has(x)) {seen.add(x); x = dig_prod(x, b)};
   console.log(seen) //DEBUG
   return x
};

TO-DO: add a function that tests if the sum of the digit sum and digit product
are equal to the input itself.
Example in decimal: 69 = 6*9 + 6+9

TO-DO: add function to test if number equals sum of divisors
with the option to include or exclude 1
*/
