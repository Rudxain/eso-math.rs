const IntN = BigInt

Math.logB = function(x, y = E) {return logB(+x, +y)}

Math.LOG2PHI = lb(PHI); Math.LNPHI = Math.log(PHI); Math.LOG10PHI = Math.log10(PHI)

Math.logPHI = function(x) {return logB(+x, PHI)}

Math.LOGPHI2 = Math.logPHI(2); Math.LOGPHIE = Math.logPHI(E); Math.LOGPHI10 = Math.logPHI(10)

Math.SQRT3 = sqrt(3)
Math.LN3 = Math.log(3); Math.LOG2_3 = lb(3)
Math.LOG10_3 = Math.log10(3); Math.LOGPHI3 = Math.logPHI(3)
//ternary lives also matter
Math.log3 = function(x) {return logB(+x, 3)}
//stop discriminating the number 3
Math.LOG3_2 = Math.log3(2); Math.LOG3E = Math.log3(E)
Math.LOG3_10 = Math.log3(10); Math.LOG3PHI = Math.log3(PHI)
//join The Order of The Triangle Of Power: https://youtu.be/sULa9Lc4pck

//lb(bigint)
IntN.log2 = function(n) {
	if ( (n = toBigInt(n)) > 0n ) return sizeOf(n, 1n, 0n)
	throw new RangeErr('Non-positive logarithmation')
}

//3 is the closest integer to `E`
IntN.logB = function(n, b = 3n) {
	n = toBigInt(n); b = toBigInt(b)
	if (n < 1n || b < 2n) throw new RangeErr('return value is -Infinity or NaN')
	return logB(n, b)
}

//Euclidean division
Math.divEuclid = function(x, y) {return floor(+x / abs(+y)) * sign(+y)}
//the other variants of int-div are too short

/**
All the integer division defnitions
@param {bigint} n numerator | dividend
@param {bigint} d denominator | divisor
@param {string} F function or variant
@return {bigint} quotient
*/
IntN.div = function(n, d, F) {
	n = toBigInt(n); d = toBigInt(d)
	const q = n / d
	//this could be wrong when using "euclid"
	if ( !(n % d) ) return q
	const s = (n < 0n) != (d < 0n) ? 1n : 0n //XOR of sign bits
	switch (String(F).trim().toLowerCase()) {
		case 'floor': default: return q - s
		case 'ceil': return q + (s ^ 1n)
		case 'round': return ((s ? -d : d) / 2n + n) / d
		case 'euclid': return (n / abs(d) - s) * sign(d)
		case 'trunc': return q
		case 'expand': return q + (s ? -1 : 1)
	}
}

//Standard Mathematical Modulo (floor). NOT remainder
//if args are floats, it can have precision errors, similarly to the naive divison-based definition
const mod = (n, d) => (n % d + d) % d

//en.wikipedia.org/wiki/Modulo_operation#Variants_of_the_definition
Math.mod = function(n, d, F) {
	n = +n; d = +d
	//fallback to 'floor' if 'F' is "euclid" or just invalid
	switch (F = String(F).trim().toLowerCase()) {
		case 'floor': case 'trunc': case 'ceil': case 'round': case 'expand': break
		case 'euclid': d = abs(d); default: F = 'floor'
	}
	return n - d * Math[F](n / d)
}
IntN.mod = function(n, d, F) {
	n = toBigInt(n); d = toBigInt(d)
	switch (F = String(F).trim().toLowerCase()) {
		case 'floor': case 'trunc': case 'ceil': case 'round': case 'expand': break
		case 'euclid': d = abs(d); default: F = 'floor'
	}
	return n - d * IntN.div(n, d, F)
}

Math.modPow = function(b, e, m) {
	if (isNan(b = +b) || isNan(e = +e) || isNan(m = +m)) return NaN
	if (e < 2 || e % 1) return mod(b ** e, m)
	b = mod(b, m)
	if (!b) return b
	let out = 1
	do {
		if (e % 2) out = mod(out * b, m)
		e = trunc(e / 2)
		b = mod(b * b, m)
	} while (e > 1)
	return mod(out * b, m)
}
IntN.modPow = function(b, e, m) {
	b = toBigInt(b); e = toBigInt(e); m = toBigInt(m)
	if (e < 2n) return mod(e < 0n ? 1n / b ** -e : b ** e, m)
	b = mod(b, m)
	if (!b) return b
	let out = 1n
	do {
		if (e & 1n) out = mod(out * b, m)
		e >>= 1n
		b = mod(b * b, m)
	} while (e > 1n)
	return mod(out * b, m)
}