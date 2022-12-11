/** https://en.wikipedia.org/wiki/Pronic_number */
import { is_numeric } from '../mod/type check'
import { isSigned } from '../mod/value check'
import { take } from '../mod/iter'
import { isEven } from '../mod/std'
import { round, trunc } from './rounding'
import { sqrt } from './root'

const Float = Number

/**
@type {{
	(x: numeric): boolean;
	(x: unknown): false;
}}
@param {unknown} x
*/
export const isPronic = x => {
	if (!is_numeric(x) || isSigned(x) || !isEven(x))
		return false

	const rt = trunc(sqrt(x))
	return rt * rt + rt == x
}

/**
get `n`th Pronic number using closed-form expression
@template {numeric} T
@param {T} n
@return {T extends number ? number : bigint}
*/
export const nthP = n => n * ++n

/** Pronic sequence */
export const iterP = function*() {
	let sum = 2n, p = 0n
	while (true) {
		yield p
		p += sum
		sum += 2n
	}
}

/** recursive Pronics */
export const iterRecurP = function* () {
	let p = 2n
	yield p
	while (true) yield p *= p + 1n
}

/** the Doubly-Pronic (recursive) constant */
export const RecurPronicCONST = (() => {
	let sum = 0
	//7 is more than enough to reach max precision
	for (const x of take(iterRecurP(), 7n))
		sum += 1 / Float(x)
	return sum
})()

/**
int Geometric Progression where ratio between terms approaches `1 / RecurPronicCONST`
*/
export const iterRecurPConstInv = function* () {
	let p = 2
	while (true) {
		yield p
		p = round(p / RecurPronicCONST)
	}
}
