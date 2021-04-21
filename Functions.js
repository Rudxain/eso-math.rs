'use strict';

Math.TAU = 2 * Math.PI;
Math.SQRT3 = Math.sqrt(3);
Math.SQRT5 = Math.sqrt(5);
Math.PHI = (1 + Math.SQRT5) / 2;
Math.LNPHI = Math.log(Math.PHI);
Math.LOG2PHI = Math.log2(Math.PHI);
Math.LOG10PHI = Math.log10(Math.PHI);
Math.logPHI = function (x) {return Math.log2(x) / Math.LOG2PHI};
//I'm using lb for better precision and performance than ln
Math.LOGPHI2 = Math.logPHI(2);
Math.LOGPHI_E = Math.logPHI(Math.E);
Math.LOGPHI10 = Math.logPHI(10);

function Big_sign(n) {return n ? (n < 0n ? -1n : 1n) : 0n}

function Big_abs(n) {return n < 0n ? -n : n}

//f < 0 = floor
//f > 0 = ceil
//falsy f = round
//floor and ceil on negative inputs return incorrect values, sorry
//truncated division (int div) is JS' default for BigInts
function Big_div(a, b, f) {return a % b ? (f ? ((a + b - 1n) / b) + (f < 0n ? -1n : 0n) : (b / 2n + a) / b) : a / b}

function Big_root(n, i=2n)
{
    let sign = Big_sign(n);
    if (sign === -1n && !(i & 1n)){return NaN} //NaN is placeholder for imaginary
    n = Big_abs(n);
    if (!n || n == 1n) {return n}
    let s = n + 1n;
    let k = i - 1n;
    let u = n;
    while (u < s) {s = u; u = (u * k + n / u ** k) / i}
    return s * sign
}

//I don't know if lb is really better but I use it anyways, lol
Math.logB = function (x, b=Math.E) {return Math.log2(x) / Math.log2(b)}

//This isn't very efficient
function Big_logB(n, b=2n) {let i = 0n; while (n > 1n) {n /= b; i++} return i}


//The following need to be enhanced/upgraded for better usefulness than JS' built-in implementations
//Converts a number N into a numeral of base B using an alternative algorithm
function toNumeralAlt(N, B, charset=[`0`,`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`,`9`,`a`,`b`,`c`,`d`,`e`,`f`,`g`,`h`,`i`,`j`,`k`,`l`,`m`,`n`,`o`,`p`,`q`,`r`,`s`,`t`,`u`,`v`,`w`,`x`,`y`,`z`,`A`,`B`,`C`,`D`,`E`,`F`,`G`,`H`,`I`,`J`,`K`,`L`,`M`,`N`,`O`,`P`,`Q`,`R`,`S`,`T`,`U`,`V`,`W`,`X`,`Y`,`Z`])
{ 
    let out = [];
    for (i=0; i < (B > 1 ? Math.floor(Math.log(N) / Math.log(B)) + 1 : N); i++)
    {
        out.unshift(charset[B > 1 ? (N % B**(i+1) - N % B**i) / B**i : 1])
    }
    return out.join(``)
}

//Returns the digit at index i of a numeral in base/radix B, with numeric value N
function getDigit(N, B, i) {return Math.floor(N / B**i) % B}

//Prints a Natural number n to its corresponding numeral in base B
function toNumeral(N, B) {dig = []; while (N > 0) {dig.unshift(N % B); N = N / B - N % B}; return dig.join(``)}

//Parses a numeral in base B and returns its value
function parseNumeral(numeral, B) {var n=0; for (d of numeral) {n = b * n + d} return n}

//Convert the digits representation of a number from a base/radix to another
function B2B(numeral, inpB, outB) {return toNumeral(parseNumeral(numeral, inpB), outB)}
//End of "the following". The next "followings" are more useful:


//en.wikipedia.org/wiki/Digital_root#Congruence_formula
function dig_rt_c(n, b){return n ? 1 + ((n - 1) % (b - 1)) : 0}

//en.wikipedia.org/wiki/Digital_root
function dig_sum(x, b)
{
    let sum = 0;
    while (x > 0) {sum += x % b; x = Math.trunc(x / b)}
    return sum
}

//persistence = seen.length - 1
function dig_rt_a(x, b)
{
    let seen = [];
    while (!(seen.includes(x))) {seen.push(x); x = dig_sum(x, b)}
    return {'x': x, 'seen': seen} //FOR DEBUG
}

//en.wikipedia.org/wiki/Multiplicative_digital_root
function dig_prod(x, b)
{
    if (!x) {return x}
    let prod = 1;
    while x > 1
    {
        if (!(x % b)) {return 0}
        if (x % b > 1) {prod *= x % b}
        x = Math.trunc(x / b)
    }
    return prod
}

function dig_rt_m(x, b)
{
    let seen = [];
    while (!(seen.includes(x))) {seen.push(x); x = dig_prod(x, b)}
    return {'x': x, 'seen': seen} //FOR DEBUG
}

//get non-integer part
function frac_m(x) {return x % 1}
//I have no idea which is better
function frac_t(x) {return x - Math.trunc(x)}

function gcd(a, b)
{
    a = Math.abs(a); b = Math.abs(b);
    let r = a > b ? [a, b] : [b, a];
    while (r[1]) {r = [r[1], r[0] % r[1]]}
    return r[0]
}

function Big_gcd(a, b)
{
    a = Big_abs(a); b = Big_abs(b);
    let c = b;
    if (a < b) {b = a; a = c}
    while (b) {c = b; b = a % b; a = c}
    return a
}

function lcm(a, b) {return Math.abs(a) / gcd(a, b) * Math.abs(b)}
function Big_lcm(a, b) {return Big_abs(a) / Big_gcd(a, b) * Big_abs(b)}

var Pa = [2, 3, 5]; // Array of Primes
var Pd = new Map(); Pd.set(2); Pd.set(3); Pd.set(5) //Primality map/dictionary
function addP()
{
    let x = Pa[Pa.length - 1] + 2;
    test:
    for (let y = Math.sqrt(x), j; true; x += 2, y = Math.sqrt(x))
    {
        if (Pd.has(x)) {break}
        if (Number.isInteger(y)) {continue} //ignore squares because they are composite
        j = 1;
        while (Pa[j] <= y) {if (x % Pa[j] === 0) {continue test} j++}
        Pd.set(x); break;
    }
    Pa.push(x)
}
function factor(n) //get prime factorization of n
{
    n = Math.abs(n);
    let m = n, i = 0, out = [];
    while (Pa[i] <= Math.sqrt(n) && Pa[i] <= m && !(Pd.has(m))) //Trust me, all 3 are necessary for speed
    {
        while (m % Pa[i] === 0) {m /= Pa[i]; out.push(Pa[i])}
        i++;
        if (i >= Pa.length) {addP()} //Primes on-demand lol
    }
    if (m > 1) {out.push(m); Pd.set(m)}
    return out
}

//factorial approximation for non-integers
function Stirling(x) {return Math.sqrt(Math.TAU * x) * (x / Math.E) ** x}

//"pseudo-recursive" (perhaps "quasi-recursive") Fact with support for any number (except BigInt and Imaginary)
//returns array because I still need to add a more efficient F to compute just 1 value
//this is optimized for returning an array
function Fact(x)
{
    let out = [1];
    for (let i = (x % 1) + Math.sign(x); out.length <= Math.abs(x); i += Math.sign(x))
    {out.push(i * out[out.length - 1])}
    return out
}

//iterative inverse Fact. If k > 1 returns corresponding inv multifactorial
function invFact(n, k = 1)
{
    if (!n) {return NaN}
    let x = (n % 1) + Math.sign(n);
    while (Math.abs(n) > 1) {x += k; n /= x}
    return x
}

//"Termial/Additorial/Sumatorial" Fs
//en.wikipedia.org/wiki/Triangular_number ; en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF

//get Nth "TriNumber" in O(1)
function trinum(x) {return x * (x + 1) / 2}

//get index of a trinum
function tri_inv(x) {return (Math.sqrt(8 * x + 1) - 1) / 2}

//get TriNums up to index x (inclusive)
function triseq(x)
{
    let out = [0];
    for (let i = (x % 1) + Math.sign(x); out.length <= Math.abs(x); i += Math.sign(x))
    {out.push(i + out[out.length - 1])}
    return out
}


//en.wikipedia.org/wiki/Polygonal_number
function ppn(i, s=3) {return (s - 2) * i**2 - (s - 4) * i) / 2}
function ipn(p, s=3) {return Math.sqrt(8 * (s - 2) * p + (s - 4)**2) + (s - 4)) / (2 * (s - 2))}
function spn(p, i=2) {return 2 + (2 / i) * ((p - i) / (i - 1))}

//get Nth Fibonacci in O(log(n))
function Fib(n) {return Math.round(Math.PHI ** n / Math.SQRT5)}

//get index of a Fib num
function invFib(F) {return F <= 1 ? F : Math.floor(Math.logPHI(F * Math.SQRT5 + 0.5))}

//en.wikipedia.org/wiki/Lucas_sequence
//If F is falsy (default) then "U", else "V"
function Lucas(n, P=1, Q=-1, F)
{
    let seq = (F ? [2, P] : [0, 1]);
    for (let i = 1; i < n; i++) {seq.push(P * seq[i] - Q * seq[i-1])}
    return seq
}

//Riemann Zeta F
function zeta(s, k=2)
{
    let sum = 1, n = 2;
    if (s > 1 && k <= 2) {for (let tmp; sum !== tmp; n++) {tmp = sum; sum += 1 / n**s}}
    else {while (n <= k) {sum += 1 / n**s; n++}}
    return sum
}

//Generalized Collatz
//en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations
function genCol(n, k=2, a=[0.5, 3], b=[0, 1], P=2)
{
    let seq = [n], i = 0;
    while (seq.length < k)
    {
        i = Math.abs(seq[seq.length - 1]) % P;
        seq.push(a[i] * seq[seq.length - 1] + b[i])
    }
    return seq
}

/*
Returns (Hailstone) sequence of n. Supports signed integers.
You can explicitly specify the k steps, or let the function detect known cycles.
Falsy s: Standard
Truthy s: "Shortcut" version
"Shortcut" is like STD but skips some Even numbers
en.wikipedia.org/wiki/Collatz_conjecture
*/
function Collatz(n, k, s)
{
    let h = [n];
    const col_c = new Map(); col_c.set(0); col_c.set(1); col_c.set(-1); col_c.set(-5); col_c.set(-17);
    while (k ? h.length < k : !(col_c.has(h[h.length - 1])))
    {h.push(h[h.length - 1] & 1 ? (3 * h[h.length - 1] + 1) / (s ? 2 : 1) : h[h.length - 1] / 2)}
    return h
}

//Unary-Numeral (Base 1) Ackermann
function UAck(m, n)
{
    while (m.length > 3)
    {
        n = n.length ? UAck(m, n.slice(0, -1)) : '1';
        m = m.slice(0, -1)
    }
    if (m.length == 3) {let len = 2 ** (n.length + 3) - 3; while (n.length < len) {n += '1'}}
    else {n = [n + '1', n + '11', n + n + '111'][m.length]}
    return n
}

function Madlatz(m, n)
{
    while (m > 1n)
    {
        if (n) {n = Madlatz(m, n-1n)} else {n = 1n}
        m = (m & 1n ? 3n * m + 1n : m / 2n)
    }
    return n+1n
}

function Coolman(m, n)
{
    while (m)
    {
        if (n < 2n) {n = 4n}
        else {let tmp = Coolman(m, n-1n); n = tmp & 1n ? 3n * tmp + 1n : tmp / 2n}
        m--
    }
    return n+1
}

var Ack_mem = {};
function Ackermann(m, n)
{
    while (m > 3)
    {
        if (!n) {n = 1n}
        else
            {
                if (Ack_mem[m + ',' + n]) {return Ack_mem[m + ',' + n]}
                n--;
                if (Ack_mem[m + ',' + n]) {n = Ack_mem[m + ',' + n]}
                else {let tmp = Ackermann(m, n); Ack_mem[m + ',' + n] = tmp; n = tmp}
            }
        m--
    }
    return [n + 1n, n + 2n, 2n * n + 3n, (2n ** (n + 3n)) - 3n][m]
}

//"Inverse" Ackermann function
function ack_inv(m, n) {for (var i=1, x=0; x < Math.log2(n); i++) {x = Ackermann(i, BigInt(Math.trunc(m / n)))}; return x}

//en.wikipedia.org/wiki/Amdahl%27s_law
function Ams(p, s) {return 1 / ((1 - p) + (p / s))}
