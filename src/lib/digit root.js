import {isBigInt as isIntN} from '../mod/type check'
import {isInfNAN} from '../mod/value check'
import {abs, signabs} from './std'
import {trunc} from './rounding'
import {isM as isMersenne} from './Mersenne'

const IntN = BigInt

//en.wikipedia.org/wiki/Digital_root#Congruence_formula
export const dig_rt_c = (n, b) => (n && (--n % --b + (isIntN(n) && isIntN(b) ? 1n : 1)))

//en.wikipedia.org/wiki/Digital_root
export const dig_sum = (x, b) => {
	let sum
	if (isIntN(x) && isIntN(b))
	{
		if (!b) return Infinity
		sum = 0n
		if (abs(b) === 1n) return sum
		while (x) {sum += x % b; x /= b}
	}
	else
	{
		x = +x
		b = +b
		if (isInfNAN(x) || isInfNAN(b) || b === 0) return x / b
		sum = 0
		if (abs(b) === 1) return sum
		while (x) {sum += x % b; x = trunc(x / b)}
	}
	return sum
}

//persistence == seen.length - 1
export const dig_rt_a = (x, b) => {
	const seen = new Set
	do {seen.add(x); x = dig_sum(x, b)} while (!seen.has(x))
	console.log(seen) //DEBUG
	return x
}

//en.wikipedia.org/wiki/Multiplicative_digital_root
export const dig_prod = (x, b) => {
	if (isIntN(x) && b === 2n)
	{//missing nega-binary optimization
		x = signabs(x)
		return IntN(isMersenne(x[1])) * x[0]
	}
	x = trunc(x); b = trunc(b)
	let prod = 1, mod
	while (x > 1){
		mod = x % b
		if (mod === 0) return 0
		prod *= mod
		x = trunc(x / b)
	}
	return prod
}

export const dig_rt_m = (x, b) => {
	const seen = new Set
	do {seen.add(x); x = dig_prod(x, b)} while (!seen.has(x))
	console.log(seen) //DEBUG
	return x
}
/*
to-do: add a function that tests if the sum of the digit sum and digit product
are equal to the input itself.
Example in decimal: 69 = 6*9 + 6+9
*/