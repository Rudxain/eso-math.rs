import {isInt} from '../helper/value check'
import {trunc} from './rounding'

const Str = String

//returns the digit at index i of a numeral in base/radix B, with numeric value N
export const getDigit = (n, b, i) => {
	n = n / b ** i % b
	return isInt(n) ? n : trunc(n)
}

//prints a Natural number n to its corresponding numeral in base B
export const toNumeral = (n, b) => {
	const dig = []
	while (n > 0) {dig.unshift(n % b); n = n / b - n % b}
	return dig.join('')
}

//parses a numeral in base B and returns its value
export const parseNumeral = (numeral, b) => {
	numeral = Str(numeral)
	let n = 0
	for (d of numeral) n = b * n + d
	return n
}

//convert the digits representation of a number from a base/radix to another
export const B2B = (numeral, inpB, outB) => toNumeral(parseNumeral(numeral, inpB), outB)