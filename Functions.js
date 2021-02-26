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

//Digital Root en.wikipedia.org/wiki/Digital_root
function dig_rt(n, m)
{
    var out = [], tmp = 0
    while (n.length > 1)
    {
        out.push(tmp + '' || n)
        for (let i = 0; i < n.length; i++) {tmp = (m ? (i ? tmp : 1) * n[i] : (i ? tmp : 0) + n[i])}
    }
    return out
}

//Factorial for Reals
function Stirling(x) {return Math.sqrt(2 * Math.PI * x) * (x / Math.E)**x}

//Fully iterative factorial. If "f" is truthy, it returns inverse F. If k > 1 returns corresponding multifactorial
function IFact(n, k=1, f)
{
    var x = 1;
    if (f) {while (n > 1) {x += k; n /= x}}
    else {for (i = 1; i <= n; i += k) {x *= i}}
    return x
}

//"Pseudo-recursive" (perhaps "semi-recursive") factorial with support for any number (except BigInt and Imaginary)
function SFact(x)
{
    let out = [1], i = (x % 1) + Math.sign(x);
    while (out.length <= Math.abs(x))
    {
        out.push(i * out[out.length - 1]); i += Math.sign(x)
    }
    return out
}

//Optimized recursive factorial with same number support as above
var Factorials={}
function RFact(x)
{
    if (Math.abs(x) <= 2) {return (Math.abs(x) == 2 ? 2 : Math.abs(x) < 1 ? 1 : x)}
    else if (Factorials[x]) {return Factorials[x]}
    else {let y = x * RFact(x - Math.sign(x)); Factorials[x] = y; return y}
}

//"Additorial (Sumatorial)" Info: en.wikipedia.org/wiki/Triangular_number
//If "f" is truthy, returns inverse
function Addit(x, f) {return (f ? -1 + Math.sqrt(1+8*x) : x*(x+1)) / 2}

//Info: en.wikipedia.org/wiki/Polygonal_number
function PPolygNum(i, s=3) {return ((s - 2) * i**2 - (s - 4) * i) / 2}
function IPolygNum(p, s=3) {return (Math.sqrt(8 * (s - 2) * p + (s - 4)**2) + (s - 4)) / (2 * (s - 2))}
function SPolygNum(p, i=2) {return 2 + (2 / i) * ((p - i) / (i - 1))}

//Info: en.wikipedia.org/wiki/Lucas_sequence
//If F is falsy (default) then "U", else "V"
function Lucas(n, P=1, Q=-1, F)
{
    var seq = (F ? [2,P] : [0,1]);
    for (i=1; i<n; i++) {seq.push(P * seq[i] - Q * seq[i-1])}
    return seq
}

n++}
return out}

//Riemann Zeta F
function zeta(s, lim=512)
{
    var sum = 0, tmp = 0;
    if (s > 1)
    {
        for (let n=1; true; n++)
        {
            sum += 1 / (n**s);
            if (sum === tmp) {return sum}
            tmp += 1 / (n**s)
        }
    }
    else
    {
        for (let n=1; n<lim; n++) {sum += 1 / (n**s)}
        return sum
    }
}

//Generalized Collatz
function GenCol(n, len=1, a=[0.5,3], b=[0,1], P=2)
{
    var seq = [n], sel = 0;
    for (i = 0; i < len; i++)
    {
        sel = (seq[i] % P) < 0 ? P + (seq[i] % P) : seq[i] % P;
        seq.push(a[sel] * seq[i] + b[sel])
    }
    return seq
}

/*
Falsey s: Standard
Truthy s: "Shortcut" version
len < 0: Inverse F
STD returns array containing Hailstone Sequence with a length proportional to len
"Shortcut" is like STD but skips some Even numbers
Inverse F could return a tree-like array because of branching
*/
function Collatz(n, len=1, s)
{
    var h = [n];
    for (i=0; i<Math.abs(len); i++)
    {
        if (len > 0) {h[i + 1] = h[i] & 1 ? (3 * h[i] + 1) / [1,2][s] : h[i + 1] = h[i] / 2}
        else {/*This is where Inverse mode executes, but IDK how to do it yet lol*/}
    }
    return h
}

function Madlatz(x, y)
{
    while (x !== 1)
    {
        if (y === 0) {y = 1}
        else {y = Madlatz(x, y-1)}
        x = ((x & 1) ? 3 * x + 1 : x / 2)
    }
    return y+1
}

function Coolman(x, y)
{
    while (x !== 0)
    {
        if (y <= 1) {y = 4}
        else {let tmp = Coolman(x, y-1); y = ((tmp & 1) ? 3 * tmp + 1 : tmp / 2)}
        x--
    }
    return y+1
}

var Ack_mem = {};
function Ackermann(m, n)
{'use strict';
    while (m > 3)
    {
        if (n === 0n) {n = 1n}
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
