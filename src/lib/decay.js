import {isBigInt as isIntN} from '../helper/type check'
import {signabs} from './std'

//Division by repeated subtraction, but the divisor gets decremented each iteration
export const decayDiv = (n, d) => {
	[n, d] = [signabs(n), signabs(d)]
	let i = isIntN(n[0]) ? 0n : 0
	while (n[1] > d[1]) {n[1] -= d[1]--; i++}
	return [n[0] * i, n[0] * n[1], d[0] * d[1]]
	//quotient, remainder, and unnamed, lol
}

//Multiplication by repeated addition, but multiplier gets decremented
export const decayMult0 = (f, m) => {
	[f, m] = [signabs(f), signabs(m)]
	if (!f[0] || !m[0]) return f[0] * m[0] //if NaN or 0 then No-Op
	let i = isIntN(m[0]) ? 0n : 0, x = f[1]
	while (i < m[1]) {x += f[1]; m[1]--; i++}
	return [n[0] * i, n[0] * n[1], d[0] * d[1]]
}

/*to-do, lol
//"multiplicand" (factor) gets decremented
const decayMult1 = (f, m) => {

}
*/