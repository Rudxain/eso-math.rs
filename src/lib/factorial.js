import { isInfNaN, isNaN } from '../mod/value check'
import { autoN, toNumeric } from '../mod/sanitize'
import { abs, sign, signabs } from './std'
import { trunc } from './rounding'

//if k > 1 returns multifactorial of that degree
export const nthFactorial = (x, k = 1) => {
	let s;[s, x] = signabs(toNumeric(x))
	k = trunc(toNumeric(k)) * s
	let out = autoN(1, x)
	for (let i = k, len = 1n; len <= x && !isInfNaN(out); i += k) { out *= i; len++ }
	return out
}

//export const iterFactorial (WIP)

//iterative inverse int Fact
//if k > 1 returns corresponding inv multifactorial
export const invFactorial = (n, k = 1) => {
	if (!(n = toNumeric(n)) || isNaN(k = toNumeric(k))) return NaN
	if (isInfNaN(n)) return n
	let out = sign(n)
	if (!k) return out
	while (abs(n) > 1) { n /= out; out += k }
	return out
}