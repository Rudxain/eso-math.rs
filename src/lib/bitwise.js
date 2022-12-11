const RangeErr = RangeError

/**
carryless multiplication
@param {bigint} a
@param {bigint} b
*/
export const clmul = (a, b) => {
	if (a < 0n || b < 0n)
		throw new RangeErr('negative CLMul is undefined')

	let prod = 0n
	while (b) {
		prod ^= (b & 1n) && a
		b >>= 1n
		a <<= 1n
	}
	return prod
}