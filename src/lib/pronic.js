import {round} from './rounding'

//https://en.wikipedia.org/wiki/Pronic_number
export const nthP = n => n * ++n //supports any numeric type
export const iterP = function*(b) {
	const n2 = b ? 2 : 2n
	let sum = n2, p = n2 ^ n2 //auto 0
	yield p
	while (true) {yield p += sum; sum += n2}
}
//list recursive Pronics
export const iterRecurP = function*(b) {
	let p = b ? 2 : 2n
	yield p
	while (true) yield p *= p + (b ? 1 : 1n)
}
//the Doubly-Pronic (recursive) constant
export const RecurPronicCONST = (() => {
	let sum = 0
	const G = iterRecurP()
	for (const _ of Array(7)) sum += 1 / Number(G.next().value)
	return sum
})()
//int Geometric Progression where ratio between terms approaches the reciprocal of the Doubly-Pronic constant
export const iterRecurPConstInv = function*() {
	let p = 2
	yield p
	while (true) yield p = round(p / RecurPronicCONST)
}
