import {isBigInt as isIntN} from '../helper/type check'
import {signabs} from './std'

//Division by repeated subtraction, but the divisor gets decremented each iteration
export const decayDiv = (n, d) => {
	[n, d] = [signabs(n), signabs(d)]

	let i = isIntN(n[0]) ? 0n : 0

	while (n[1] > d[1]) {
		n[1] -= d[1]--
		i++
	}

	//quotient, remainder, and unnamed, lol
	return [n[0] * i, n[0] * n[1], d[0] * d[1]]
}

/**
Multiplication by repeated addition, but multiplier gets decremented
*/
export const decayMult0 = (f, d) => {
	[f, d] = [signabs(f), signabs(d)]

	if (!f[0] || !d[0])
		return f[0] * d[0]

	let i = isIntN(d[0]) ? 0n : 0, n = f[1]

	while (i < d[1]) {
		n += f[1]
		d[1]--
		i++
	}

	return [n[0] * i, n[0] * n[1], d[0] * d[1]]
}

/*to-do, lol
//"multiplicand" (factor) gets decremented
const decayMult1 = (f, m) => {

}
*/