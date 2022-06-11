import {isBigInt as isIntN} from '../helper/type check'
import {autoN, toNumeric} from '../helper/sanitize'
import {sqrt} from './root'

//"Termial/Additorial/Sumatorial" Fs
//en.wikipedia.org/wiki/Triangular_number ; en.wikipedia.org/wiki/1_%2B_2_%2B_3_%2B_4_%2B_%E2%8B%AF
export const nthTriNum = x => {
	const ONE = autoN(1, x = toNumeric(x)), TWO = autoN(2, ONE)
	//lower overflow probability
	return x % TWO
	? (x + ONE) / TWO * x
	: x / TWO * (x + ONE)
}
//get index of a trinum
export const invTriNum = x => {
	return isIntN(x = toNumeric(x))
	? (sqrt((x << 3n) | 1n) - 1n) >> 1n
	: (sqrt(8 * x + 1) - 1) / 2
}
export const iterTri = function*(s, b) {
	let t = b ? 0 : 0n
	s = s ? -(t**t) : t**t
	let i = s
	while (Infinity) {yield t; t += i; i += s}
}