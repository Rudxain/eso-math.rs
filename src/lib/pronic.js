/** https://en.wikipedia.org/wiki/Pronic_number */
import { take } from '../mod/iter'
import { round } from './rounding'

const Float = Number

export const isPronic = x => { }

export const nthP = n => n * ++n //supports any numeric type
export const iterP = function* (b) {
	const n2 = b ? 2 : 2n
	let sum = n2, p = n2 ^ n2 //auto 0
	yield p
	while (true) { yield p += sum; sum += n2 }
}

/** list recursive Pronics */
export const iterRecurP = function* () {
	let p = 2n
	yield p
	while (true) yield p *= p + 1n
}

/** the Doubly-Pronic (recursive) constant */
export const RecurPronicCONST = (() => {
	let sum = 0
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
