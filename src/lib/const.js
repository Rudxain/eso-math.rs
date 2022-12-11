/** sum of inverse `pow`s of itself */
export const invPowSum = (() => {
	let i = 0, out = 0, tmp
	while (out !== tmp) {
		tmp = out
		out += out ** (-i)
		i++
	}
	return out
})()
