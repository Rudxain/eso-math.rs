/**
get only the first `n` items from an iterator
@template X, Y, Z I have no idea if this is correct
@param {Generator<X, Y, Z>} g
@param {bigint} n
*/
export const take = function*(g, n) {
	for (; n > 0n; n -= 1n) {
		const o = g.next()
		if (o.done) return
		yield o.value
	}
}