/**
"Termial/Additorial/Sumatorial" Fs
https://en.wikipedia.org/wiki/Triangular_number
https://en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF
*/

import { isBigInt as isIntN } from '../mod/type check'
import { isInt } from '../mod/value check'
import { autoN } from '../mod/sanitize'
import { abs, divrem } from '../mod/std'
import { sqrt } from './root'
import { isSquare } from './power'

export const isTriNum = x => {
	if (!isInt(x)) return false
	const m = abs(x % autoN(27, x))
	return (m == 1 || m == 10)
		&& (x % autoN(3, x) == 0 || abs(x % autoN(9, x)) == 1)
		&& isSquare(autoN(8, x) * x + autoN(1, x))
}

/**
@template {numeric} T
@param {T} x
@return {T}
*/
export const nthTriNum = x => {
	const n1 = autoN(1, x),
		n2 = autoN(2, x),
		[q, r] = divrem(x, n2)
	return r //lower overflow probability
		? (x + n1) / n2 * x
		: q * (x + n1)
}

/**
get index of a trinum
@template {numeric} T
@param {T} x
@return {T}
*/
export const invTriNum = x => {
	return isIntN(x)
		? (sqrt((x << 3n) | 1n) & -2n) >> 1n
		: (sqrt(8 * x + 1) - 1) / 2
}

export const iterTri = function* (s, b) {
	let t = b ? 0 : 0n
	const n1 = autoN(1, t)
	s = s ? -n1 : n1
	let i = s
	while (true) { yield t; t += i; i += s }
}