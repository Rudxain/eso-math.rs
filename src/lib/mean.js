/**
Arithmetic-Geometric Mean.
This is just an approximation, because of rounding errors
@param {number} x
@param {number} y
*/
export const agm = (x, y) => {
	//avoid round-errors and increase efficiency
	if (x == y) return x
	let a
	do [x, y, a] = [(x + y) / 2, (x * y) ** 0.5, x]
	while (x != a && x == x) /*
	the 1st condition "squeezes" all the precision.
	the 2nd prevents EVERY possible infinite loop (the 1st also helps).
	100% halt guarantee. If it doesn't halt, you get a refund lol
	*/
	return x
}