import {toBigInt as toIntN} from '../helper/sanitize'
import {sizeOf} from '../lib/bitwise'
import {M as nthMersenne} from '../lib/Mersenne'

const IntN = BigInt, RangeErr = RangeError, RNG = Math.random

//interval [0, n), or (n, 0] if negative. By default, it returns an uInt64
IntN.random = function(n = 1n << 0x40n) {
	n = toIntN(n); const s = n < 0n
	if (s) n = -n //abs
	if (n < 2n) {if (n) return 0n; else throw new RangeErr('requested an int equal and NOT equal to zero')}
	const n_len = sizeOf(n, 1n, 1n), b = 52n
	let x, x_len, max
	do {
		//in this context, the size of 0 is defined as zero instead of 1
		x = x_len = 0n
		do {
			//build the bigint in `b` blocks, to discard less rand data
			x <<= b; x_len += b
			//`crypto.getRandomValues` is probably unnecesary
			x |= IntN(RNG() * 2 ** 52)
		} while (x_len <= n_len)
		//this condition and the `-1` allow `%` to never be no-op
		const len_d = x_len - n_len - 1n
		x >>= len_d; x_len -= len_d
		max = nthMersenne(x_len)
		//https://stackoverflow.com/a/10984975
	} while (x >= max - max % n)
	x %= n; return s ? -x : x
}

export {BigInt}