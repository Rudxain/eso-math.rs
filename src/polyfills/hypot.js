import { toBigInt } from '../helper/sanitize'
import { abs } from '../lib/std'
import { sqrt } from '../lib/root'

BigInt.hypot = function (...values) {
	if (values.length == 1)
		return abs(toBigInt(values[0]))
	let sum = 0n
	for (; values.length; values.length--)
		sum += toBigInt(values[values.length - 1]) ** 2n
	return sqrt(sum)
}
export default BigInt