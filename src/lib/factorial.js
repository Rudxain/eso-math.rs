import {isInfNaN} from '../helper/value check'
import {autoN, toNumeric} from '../helper/sanitize'
import {abs, sign, signabs} from './std'
import {trunc} from './rounding'
import {sqrt} from './root'
import {TAU} from './const'

const {PI, E, sin: sine, exp} = Math, {isNaN: isNan} = Number

//factorial approximations for non-ints.
//These 3 are trash, none make use of full precision. I need help to make these more accurate
export const Gosper = x => sqrt((+x + 1 / 6) * TAU) * (x / E) ** x //improvement of Stirling
//Gamma Function (+1) defined as Summation instead of Integration
export const Gamma = x => {
	let t = 1, s0, s1 = 0 ** x
	do {s0 = s1; s1 += t ** x * exp(-t); t++} while (s0 != s1)
	return s0
}
//https://en.wikipedia.org/wiki/Lanczos_approximation#Simple_implementation
export const Lanczos = z => {
	const p = [
		676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
		12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
	]
	if (z < 0.5) return PI / (sine(PI * z) * Lanczos(1 - z))
	else {
		z--; let x = 0.99999999999980993
		for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1)
		const t = z - 0.5 + p.length
		return sqrt(TAU) * t ** (z + 0.5) * exp(-t) * x
	}
}

//if k > 1 returns multifactorial of that degree
export const nthFactorial = (x, k = 1) => {
	let s; [s, x] = signabs(toNumeric(x))
	k = trunc(toNumeric(k)) * s
	let out = autoN(1, x)
	for (let i = k, len = 1n; len <= x && !isInfNaN(out); i += k) {out *= i; len++}
	return out
}

//export const iterFactorial (WIP)

//iterative inverse int Fact
//if k > 1 returns corresponding inv multifactorial
export const invFactorial = (n, k = 1) => {
	if ( !(n = toNumeric(n)) || isNan(k = toNumeric(k)) ) return NaN
	if (isInfNaN(n)) return n
	let out = sign(n)
	if (!k) return out
	while (abs(n) > 1) {n /= out; out += k}
	return out
}