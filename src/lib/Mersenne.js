import {isBigInt as isIntN} from '../mod/type check'
import {isInt} from '../mod/value check'
import {isPow2} from './power'

/**
@template {numeric} T
@param {T} n
*/
export const M = n => /**@type {T}*/(isIntN(n) ? ~(-1n << /**@type {bigint}*/(n)) : 2**n - 1)

/**
@template T
@param {T} x
@return {T extends numeric ? boolean : false}
*/
export const isM = x => {
	//@ts-ignore
	if (!isInt(x) || x < 1) return false
	//@ts-ignore
	if (isIntN(x)) return !(x & (x + 1n))
	//@ts-ignore
	if (x >= 2 ** 53) return false //every "unsafe" int has trailing zeros
	//@ts-ignore
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