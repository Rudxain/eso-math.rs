Math.PHI = (1 + Math.sqrt(5)) / 2;

function Big_sign(n) {return n == 0n ? 0n : (n < 0n ? -1n : 1n)}

function Big_abs(n) {return n * Big_sign(n)}

//Converts a number N into a numeral of base B using an alternative method
function toNumeralAlt(N, B, charset=[`0`,`1`,`2`,`3`,`4`,`5`,`6`,`7`,`8`,`9`,`a`,`b`,`c`,`d`,`e`,`f`,`g`,`h`,`i`,`j`,`k`,`l`,`m`,`n`,`o`,`p`,`q`,`r`,`s`,`t`,`u`,`v`,`w`,`x`,`y`,`z`,`A`,`B`,`C`,`D`,`E`,`F`,`G`,`H`,`I`,`J`,`K`,`L`,`M`,`N`,`O`,`P`,`Q`,`R`,`S`,`T`,`U`,`V`,`W`,`X`,`Y`,`Z`])
{ 
    var charset = (Array.isArray(charset) ? charset : charset.split(``)), out=[];
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
function Base2Base(numeral, InB, OutB) {return toNumeral(parseNumeral(numeral, InB), OutB)}

//Digital Root. Returns the sequence of values for each iteration
//If m is truthy, it usea multiplicative mode instead of additive
//en.wikipedia.org/wiki/Digital_root
function dig_rt(n, m)
{
    var out = [], tmp = 0
    while (n.length > 1)
    {
        out.push(tmp + '' || n)
        for (let i = 0; i < n.length; i++) {tmp = (m ? (i ? tmp : 1) * n[i] : (i && tmp) + n[i])}
    }
    return out
}

//elegant (no auxiliary var) GCD, with support for signeds
function gcd(a, b)
{
    a = Math.abs(a); b = Math.abs(b);
    let r = a > b ? [a, b] : [b, a];
    while (r[1]) {r = [r[1], r[0] % r[1]]}
    return r[0]
}

//GCD for BigInt, also supports signeds
function Big_gcd(a, b)
{
    a = Big_abs(a); b = Big_abs(b);
    let c = b;
    if (a < b) {b = a; a = c}
    while (b) {c = b; b = a % b; a = c}
    return a
}

function lcm(a, b) {return ((typeof a == 'bigint' ? Big_abs(a) : Math.abs(a)) / gcd(a, b)) * (typeof b == 'bigint' ? Big_abs(b) : Math.abs(b))}

var Pa = [2, 3, 5] // Array of Primes
var Pd = {2:true, 3:true, 5:true} //Primality dictionary
function addP()
{
    let x = Pa[Pa.length - 1] + 2, y = Math.sqrt(x);
    for (let j = 1; true; x += 2, y = Math.sqrt(x))
    {
        if (y == Math.trunc(y)) {continue} //ignore squares because they are composite
        j = 1;
        while (Pa[j] <= y && (x % Pa[j])) {j++}
        if (!(x % Pa[j])) {continue}
        Pa.push(x); Pd[x] = true; break;
    }
}
function factorize(n)
{
    n = Math.abs(n);
    let m = n, i = 0, out = [];
    while (Pa[i] <= Math.sqrt(n) && Pa[i] <= m && !Pd[m]) //Trust me, all 3 are necessary for speed
    {
        while (!(m % Pa[i])) {m /= Pa[i]; out.push(Pa[i])}
        i++;
        if (i >= Pa.length) {addP()} //Primes on-demand, like modern TV lol
    }
    if (m != 1){out.push(m); Pd[m] = true}
    return out
}

//Factorial for Reals
function Stirling(x) {return Math.sqrt(2 * Math.PI * x) * (x / Math.E)**x}

//"pseudo-recursive" (perhaps "semi-recursive") Fact with support for any number (except BigInt and Imaginary)
function Fact(x)
{
    let out = [1], i = (x % 1) + Math.sign(x);
    while (out.length <= Math.abs(x))
    {
        out.push(i * out[out.length - 1]); i += Math.sign(x)
    }
    return out
}

//Iterative inverse Fact. If k > 1 returns corresponding inv multifactorial
function invFact(n, k=1)
{
    var x = 1;
    while (n > 1) {x += k; n /= x}
    return x
}

//"Termial/Additorial/Sumatorial" Fs
//Info: en.wikipedia.org/wiki/Triangular_number ; en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF

//Get Nth (x) "TriNumber" in O(1). If "f" is truthy, returns inverse
function trinum(x, f) {return (f ? -1 + Math.sqrt(1 + 8*x) : x*(x+1)) / 2}

//Get TriNums up to index x (inclusive)
function triseq(x)
{
    let out = [0], i = (x % 1) + Math.sign(x);
    while (out.length <= Math.abs(x))
    {
        out.push(i + out[out.length - 1]); i += Math.sign(x)
    }
    return out
}


//Info: en.wikipedia.org/wiki/Polygonal_number
function ppn(i, s=3) {return ((s - 2) * i**2 - (s - 4) * i) / 2}
function ipn(p, s=3) {return (Math.sqrt(8 * (s - 2) * p + (s - 4)**2) + (s - 4)) / (2 * (s - 2))}
function spn(p, i=2) {return 2 + (2 / i) * ((p - i) / (i - 1))}

//Get Nth Fibonacci number in O(1)
function Fib1(n) {return Math.round(Math.PHI ** n / Math.sqrt(5))}

//Inverse Fib, returns the index of a Fib num
function invFib(F) {return Math.floor(Math.log(F * Math.sqrt(5) + 0.5) / Math.log(Math.PHI))}

//Info: en.wikipedia.org/wiki/Lucas_sequence
//If F is falsy (default) then "U", else "V"
//Default returns Fib seq
function Lucas(n, P=1, Q=-1, F)
{
    var seq = (F ? [2,P] : [0,1]);
    for (i=1; i<n; i++) {seq.push(P * seq[i] - Q * seq[i-1])}
    return seq
}

//Riemann Zeta F
function zeta(s, lim=512)
{
    var sum = 0;
    if (s > 1)
    {
        let tmp = 0;
        for (let n=1; true; n++)
        {
            sum += 1 / (n**s);
            if (sum === tmp) {break}
            tmp += 1 / (n**s)
        }
    }
    else {for (let n=1; n<lim; n++) {sum += 1 / (n**s)}}
    return sum
}

//Generalized Collatz
//en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations
function genCol(n, k=2, a=[0.5,3], b=[0,1], P=2)
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
    var h = [n];
    while (k ? h.length < k : !{0:true, 1:true, '-1':true, '-5':true, '-17':true}[h[h.length - 1]])
    {
        h.push(h[h.length - 1] % 2 ? (3 * h[h.length - 1] + 1) / (s ? 2 : 1) : h[h.length - 1] / 2)
    }
    return h
}

//Unary-Numeral Ackermann
function UAck(m, n)
{
    while (m.length > 3)
    {
        n = n.length ? UAck(m, n.slice(0, -1)) : '1';
        m = m.slice(0, -1)
    }
    if (m.length == 3) {let len = n.length; while (n.length < 2**(len + 3) - 3) {n += '1'}}
    else {n = [n + '1', n + '11', n + n + '111'][m.length]}
    return n
}

function Madlatz(x, y)
{
    while (x !== 1)
    {
        y = y === 0 ? 1 : Madlatz(x, y-1);
        x = (x % 2 ? 3 * x + 1 : x / 2)
    }
    return y+1
}

function Coolman(x, y)
{
    while (x)
    {
        if (y < 2) {y = 4}
        else {let tmp = Coolman(x, y-1); y = tmp % 2 ? 3 * tmp + 1 : tmp / 2}
        x--
    }
    return y+1
}

var Ack_mem = {};
function Ackermann(m, n)
{'use strict';
    while (m > 3)
    {
        if (!n) {n = 1n}
        else
            {
                if (Ack_mem[m + ',' + n]) {return Ack_mem[m + ',' + n]}
                n--;
                if (Ack_mem[m + ',' + n]) {n = Ack_mem[m + ',' + n]}
                else {let out = Ackermann(m, n); Ack_mem[m + ',' + n] = out; n = out}
            }
        m--
    }
    return [n + 1n, n + 2n, 2n * n + 3n, (2n ** (n + 3n)) - 3n][m]
}

//"Inverse" Ackermann function
function ack_inv(m, n) {for (var i=1, x=0; x < Math.log2(n); i++) {x = Ackermann(i, BigInt(Math.trunc(m / n)))}; return x}

//en.wikipedia.org/wiki/Amdahl%27s_law
function Ams(p, s) {return 1/((1-p) + (p/s))}
