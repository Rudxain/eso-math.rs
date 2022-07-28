import {isBigInt as isIntN} from '../helper/type check'
import {isInt} from '../helper/value check'
import {autoN, toNumeric} from '../helper/sanitize'
import {abs, divrem} from './std'
import {sqrt} from './root'
import {isSquare} from './power'

/*
"Termial/Additorial/Sumatorial" Fs
https://en.wikipedia.org/wiki/Triangular_number
https://en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF
*/

export const isTriNum = x => {
	if ( !isInt(x) ) return false
	const m = abs(x % autoN(27,x))
	return (m == 1 || m == 10)
		&& (x % autoN(3,x) == 0 || abs(x % autoN(9,x)) == 1)
		&& isSquare( autoN(8,x) * x + autoN(1,x) )
}

export const nthTriNum = x => {
	const ONE = autoN(1, x = toNumeric(x)),
		TWO = autoN(2,x),
		[q, r] = divrem(x, TWO)
	return r //lower overflow probability
		? (x + ONE) / TWO * x
		: q * (x + ONE)
}

//get index of a trinum
export const invTriNum = x => {
	return isIntN(x = toNumeric(x))
	? ( sqrt((x << 3n) | 1n) & -2n ) >> 1n
	: ( sqrt(8 * x + 1) - 1 ) / 2
}

export const iterTri = function*(s, b) {
	let t = b ? 0 : 0n
	s = s ? -(t**t) : t**t
	let i = s
	while (Infinity) {yield t; t += i; i += s}
}