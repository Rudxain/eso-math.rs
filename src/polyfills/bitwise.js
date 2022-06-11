import {toBigInt} from '../helper/sanitize'
import {ctz, popCount, clmul} from '../lib/bitwise'

const RangeErr = RangeError

//logarithmic binary search is faster than linear, but the engine will do it for us
Math.ctz32 = function(x) {return ctz(+x >>> 0)}
IntN.ctz = function(n) {if (n = toBigInt(n)) return ctz(n); throw new RangeErr('return value is Infinity')}

Math.popcnt32 = function(x) {return popCount(+x >>> 0)}
IntN.popcnt = function(n) {
	if ((n = toBigInt(n)) >= 0n) return popCount(n)
	throw new RangeErr('return value is Infinity')
}

//reverse the order of bits using "binary chop"
Math.rev32 = function(x) {
	x = +x | 0
	x = ((x & 0xffff0000) >>> 0x10) | ((x & 0x0000ffff) << 0x10)
	x = ((x & 0xff00ff00) >>> 8) | ((x & 0x00ff00ff) << 8)
	x = ((x & 0xf0f0f0f0) >>> 4) | ((x & 0x0f0f0f0f) << 4)
	x = ((x & 0xcccccccc) >>> 2) | ((x & 0x33333333) << 2)
	x = ((x & 0xaaaaaaaa) >>> 1) | ((x & 0x55555555) << 1)
	return x >>> 0 //toUint32
}

//circular left shift
Math.rotl32 = function(n, b) {
	n = +n; b = +b & 31 //coerce and throw the same error as built-ins, then apply mod 32
	n = (n << b) | (n >>> (32 - b))
	return n >>> 0
}
//circular right shift
Math.rotr32 = function(n, b) {n = +n; b = +b & 31; return ((n >>> b) | (n << (32 - b))) >>> 0}

//bitwise (logical base 2, not artihmetic) carryless multiplication
Math.clmul32 = function(x, y) {
	x = +x >>> 0; y = +y >>> 0;
	let prod = 0
	while (y) {prod ^= (y & 1) && x; y >>>= 1; x <<= 1}
	return prod >>> 0
}
//IDK if the naive definition is fast
IntN.clmul = function(a, b) {
	a = toBigInt(a)
	b = toBigInt(b)
	//can it be defined?
	if (a >= 0n && b >= 0n) return clmul(a, b)
	throw new RangeErr('negative carryless product is undefined')
}

export {Math}