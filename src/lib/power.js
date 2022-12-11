import {isBigInt as isIntN} from '../mod/type check'
import {isInt} from '../mod/value check'
import {abs} from '../mod/std'
import {trunc} from './rounding'
import {sizeOf, ctz} from '../mod/bitwise'
import {root, sqrt, cbrt} from './root'

const lb = Math.log2

export const isPow2 = x => {
	//1 is odd, so it's not a power of 2. It's a trivial power, because 1 is a power of any Real num
	if (!isInt(x) || x < 2) return false
	if (isIntN(x)) return !(x & (x - 1n))
	return isInt(lb(x))
}

export const isSquare = x => {
	if (!isInt(x)) return false
	if (x < 2) return x >= 0
	const c = ctz(x)
	if (isIntN(x))
	{
		if (c & 1n) return false
		x >>= c
		return (x & 7n) == 1n && sqrt(x) ** 2n == x
	}
	else
	{
		if (c % 2) return false
		x /= 2 ** c
		return x % 8 == 1 && isInt(sqrt(x))
	}
}

export const isCube = x => {
	if (!isInt(x)) return false
	if (!x) return true
	const c = ctz(x)
	if (isIntN(x))
	{
		if (c % 3n) return false
		//the engine will probably reuse the shifted local copy of `n` inside `ctz`
		x >>= c
		/*
		`abs` is O(n) in worst-case only, so we must use it sparingly.
		Inverting the math sign of an odd number doesn't need sum, just (~n | 1n).
		But we can reduce those 2 ops to 1. XORing with minus-two flips all bits except LSB,
		like this: `if (n < 0n) n ^= -2n`
		bitwise ops are fully parallelizable, increasing potential speed.
		However, this micro-algorithm is deprecated because computing the `abs` of a remainder < 9 is faster
		*/
		let m = abs(x % 9n); if (m > 1n && m != 8n) return false
			m = abs(x % 7n); if (m > 1n && m != 6n) return false
		return cbrt(x) ** 3n == x
	}
	else
	{
		if ((x = abs(x)) < 2) return true
		if (c % 3) return false
		x /= 2 ** c
		//https://math.stackexchange.com/a/2190888
		let m = x % 9; if (m > 1 && m != 8) return false
			m = x % 7; if (m > 1 && m != 6) return false
		return isInt(cbrt(x))
	}
}

//test if `n` is a strict perfect power. n = b ^ e, e > 1
export const isPow = x => {
	if (!isInt(x)) return false
	//sign doesn't matter because Complex numbers exist
	if ((x = abs(x)) < 4) return x < 2
	if (isPow2(x) || isSquare(x) || isCube(x)) return true
	if (isIntN(x))
	{
		const lbx = sizeOf(x, 1n, 0n)
		for (let e = 5n; e < lbx; e += 2n) {
			//we already discarded cubes, so we can skip all of them
			if (!(e % 3n)) continue
			if (root(x, e) ** e == x) return true
		}
		return false
	}
	else
	{
		const lbx = trunc(lb(x))
		for (let e = 5; e < lbx; e += 2) {
			if (!(e % 3)) continue
			if (isInt(root(x, e))) return true
		}
		return false
	}
}