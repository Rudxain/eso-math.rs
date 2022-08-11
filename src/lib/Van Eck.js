import '../typedefs'
import {autoN, toNumeric} from '../helper/sanitize'
import {abs} from './std'
import {trunc} from './rounding'
/**
generalized Van Eck seq.
the algorithm has been optimized for speed and memory usage
uses a "map" to avoid linear search
@param {numeric} pad padding
*/
export const VanEck = function*(pad = 0n) {
	pad = abs(trunc(toNumeric(pad)))
	let seed = pad

	const M = []/*
	Array can be used instead of Map, because the growth rate is linear
	and there's a conjecture that states all Naturals appear in the sequence,
	so the undefined slots will eventually be filled
	while more gaps are created simultaneously
	*/
	const n1 = autoN(1,pad), n2 = n1 + n1
	//length of sequence, and value before seed, respectively
	let len = n1, pre
	while (true){
		yield pre = seed
		seed = M[pre] !== undefined ? len - n1 - M[pre] : pad
		M[pre] = ++len - n2
	}
}