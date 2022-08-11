import {isBigInt as isIntN} from '../helper/type check'
import {isInt} from '../helper/value check'
import {autoN, toNumeric} from '../helper/sanitize'
import {signabs} from './std'
import {isSquare} from './power'
import {round, floor} from './rounding'
import {SQRT5, PHI} from './const'

export const isFib = x => {
	if (!isInt(x)) return false
	const n4 = autoN(4, x)
	//https://en.wikipedia.org/wiki/Fibonacci_number#Identification
	x *= autoN(5, x) * x
	return isSquare(x + n4) || isSquare(x - n4)
}

export const nthFib = x => {
	x = toNumeric(x)
	let s; [s, x] = signabs(x)
	//https://en.wikipedia.org/wiki/Generalizations_of_Fibonacci_numbers#Extension_to_negative_integers
	if (!isIntN(x)) return round(PHI ** x / SQRT5) * (s == -1 && x % 2 == 0 ? -1 : 1)
	const e = !(x & 1n)
	if (x < 2n) return x
	//https://en.wikipedia.org/wiki/Fibonacci_number#Matrix_form
	let A = [1n,1n,1n,0n], //Fib matrix
		B = [1n,0n,0n,1n] //identity matrix

	const mm = (A, B) => [ //multiply 2x2 matrices
		A[0]*B[0] + A[1]*B[2], A[0]*B[1] + A[1]*B[3],
		A[2]*B[0] + A[3]*B[2], A[2]*B[1] + A[3]*B[3]
	]
	do {
		if (x & 1n) B = mm(B, A)
		x >>= 1n
		A = mm(A,A)
	} while (x > 1n)
	return mm(A, B)[1] * (s && e ? -1n : 1n)
}

//get index of a Fib
export const invFib = x => {
	let s; [s, x] = signabs(Number(x))
	const i = floor(logB(x * SQRT5 + 0.5, PHI))
	return !(i % 2) && s == -1 ? NaN : i * s
}

export const iterFib = function*(x){
	let a = x ? 0 : 0n,
		b = x ? 1 : 1n
	while (true) { yield a; [a, b] = [b, a + b] }
}

//en.wikipedia.org/wiki/Lucas_sequence
//co-recursive Lucas function
//If F is falsy (default) then "U", else "V"
export const Lucas = function*(P = 1, Q = -1, F) {
	P = toNumeric(P); Q = toNumeric(Q)
	//this XOR is used to throw early when values are not same-type
	const n0 = P^P^Q^Q, n1 = n0**n0, n2 = n1+n1

	let [a, b] = F ? [n2, P] : [n0, n1]
	while (true) { yield a; [a, b] = [b, P * b - Q * a] }
}
