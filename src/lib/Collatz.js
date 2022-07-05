import {isInfNaN} from '../helper/value check'
import {lcm} from './factors'

const Float = Number, Int = BigInt, _Set = Set

//generalized Collatz
//en.wikipedia.org/wiki/Collatz_conjecture#Undecidable_generalizations
export const Collatz_gen = (n, k = 2, a=[[1, 2], [3, 1]], b=[[0, 1], [1, 1]], P = 2) => {
	n = toNumeric(n)
	if (isInfNaN(n)) return //`undefined` is more correct than `[]`
	P = toNumeric(P)
	if (typeof P != 'bigint') P = trunc(P)
	let i, tmp
	const seq = [n]
	const addFrac = (f0, f1) => {
		//format is [num, den]
		const x = lcm(f0[1], f1[1])
		return [x / f0[1] * f0[0] + x / f1[1] * f1[0], x]
	}
	while (seq.length < Float(k))
	{
		i = seq.at(-1) % P
		const Fi = Float(i)
		tmp = addFrac([seq.at(-1) * a.at(Fi)[0] / a.at(Fi)[1], 1], b.at(Fi))
		seq[seq.length] = tmp[0] / tmp[1] //push
	}
	return seq.slice(1)
}

/*
Returns (Hailstone) seq of n. Supports signed integers.
You can explicitly specify the k steps, or let it detect known cycles.
Falsy s: Standard
Truthy s: "Shortcut" version
"Shortcut" is like Standard but skips some Even numbers
en.wikipedia.org/wiki/Collatz_conjecture
*/
export const Collatz_std = (n, k, s) => {
	n = n?.valueOf(); k = Float(k)
	const h = []
	if (typeof n == 'bigint')
	{
		h[h.length] = n
		const CYCLES = new _Set([1n, 0n, -1n, -5n, -17n])
		while (k ? h.length < k : !CYCLES.has(h.at(-1)))
			h[h.length] = h.at(-1) & 1n
				? (3n * h.at(-1) + 1n) / (s ? 2n : 1n)
				: h.at(-1) / 2n
	}
	else
	{
		h[h.length] = trunc(n)
		const CYCLES = new _Set([1, 0, -1, -5, -17, Infinity, -Infinity, NaN])
		while (k ? h.length < k : !CYCLES.has(h.at(-1)))
			h[h.length] = h.at(-1) % 2
				? (3 * h.at(-1) + 1) / (s ? 2 : 1)
				: h.at(-1) / 2
	}
	return h.slice(1)
}
//TO-DO: use remove all CTZ on shortcut mode

//additive seq
export const Collatz_add = function* (seed) {
	yield seed = Int(seed)
	while (true) yield seed += seed & 1n ? 3n * seed + 1n : seed >> 1n
}
