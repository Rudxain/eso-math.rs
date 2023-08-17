/**
Arithmetic-Geometric Mean.
This is just an approximation, because of rounding errors
@param {number} x
@param {number} y
*/
export const agm = (x, y) => {
	// avoid round-errors and increase efficiency
	if (x == y) return x
	let a = NaN, i = 0
	do [x, y, a, i] = [(x + y) / 2, (x * y) ** 0.5, x, i + 1]
	while (x != a && x == x && i < 0x20)
	// 1st condition "squeezes" all the precision,
	// 2nd prevents potential infinite loop (1st also helps),
	// 3rd guarantees halting when edge-cases happen
	// (32 iterations is more than enough for convergence)
	return x
}
