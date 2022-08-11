import {isBigInt as isIntN} from '../helper/type check'
import {isInt} from '../helper/value check'
import {isPow2} from './power'

export const M = n => isIntN(n) ? ~(-1n << n) : 2**n - 1
export const isM = x => {
	if (!isInt(x) || x < 1) return false
	if (isIntN(x)) return !(x & (x + 1n))
	if (x >= 2 ** 53) return false //every "unsafe" int has trailing zeros
	return isPow2(x + 1)
}
/*WIP
export const invM = (m, b) => {
	if (!isBigInt(m)) {const n = lb(+m + 1); return b ? [isM(m), n] : n}
	const out = [false, 0n]

}
*/
export const iterM = function*() {
	let n = 1n
	while (true) {yield n; n <<= 1n; n |= 1n}
}