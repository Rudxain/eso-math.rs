import {abs} from './std'
import {trunc} from './rounding'
/*
generalized Van Eck seq.
the algorithm has been optimized for speed and memory usage
uses a "map" to avoid linear search
*/
export const VanEck = function*(pad) {
	pad = pad?.valueOf()
	const B = typeof pad == 'bigint'
	if (!B) pad = trunc(pad) || 0
	pad = abs(pad)
	let seed = pad
	const M = []/*
	Array can be used instead of Map, because the growth rate is linear
	and there's a conjecture that states all Naturals appear in the sequence,
	so the undefined slots will eventually be filled
	while more gaps are created simultaneously
	*/
	const u = B ? 1n : 1
	//length of sequence, and value before seed, respectively
	let len = u, pre = NaN
	//literal infinite loop
	while (Infinity){
		yield pre = seed
		seed = M[pre] !== undefined ? len - u - M[pre] : pad
		M[pre] = ++len - u - u
	}
}