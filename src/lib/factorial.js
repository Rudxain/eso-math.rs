import { isInfNAN, isNAN } from '../mod/value check'
import { autoN } from '../mod/sanitize'
import { abs, sign, signabs } from '../mod/std'
import { trunc } from './rounding'

/**
@template {numeric} T
@param {T} x
@param {T} k multifactorial degree. `k = 1` is standard
*/
export const nthFactorial = (x, k = 1) => {
	const [x_sgn, x_abs] = signabs(x)
	k = trunc(k) * x_sgn
	let out = autoN(1, x_abs)
	for (let i = k, len = 1n; len <= x_abs && !isInfNAN(out); i += k) {
		out *= i
		len++
	}
	return out
}

//export const iterFactorial (WIP)

/**
iterative inverse int Fact
@template {numeric} T
@param {T} n
@param {T} k multifactorial degree. `k = 1` is standard
*/
export const invFactorial = (n, k = 1) => {
	if (!n || isNAN(k)) return NaN
	if (isInfNAN(n)) return n
	let out = sign(n)
	if (!k) return out
	while (abs(n) > 1) { n /= out; out += k }
	return out
}