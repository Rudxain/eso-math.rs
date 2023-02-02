import { isInt } from '../mod/value check'
import { autoN } from '../mod/sanitize'
import { logB, signabs } from '../mod/std'
import { isSquare } from './power'
import { round, floor } from './rounding'
import { SQRT5, PHI } from '../mod/const'

/**
@template T
@param {T} x
*/
export const isFib = x => {
	if (!isInt(x)) return false
	let x_int = /**@type {T extends numeric ? T : never}*/(x)
	const n4 = autoN(4, x_int)
	//https://en.wikipedia.org/wiki/Fibonacci_number#Identification
	//@ts-ignore
	x_int *= autoN(5, x_int) * x_int
	// to-do: use `satisfies` when available: https://github.com/microsoft/TypeScript/issues/51086
	//@ts-ignore
	return isSquare(x_int + n4) || isSquare(x_int - n4)
}

/**@return {matrix2x2<bigint>}*/
const identity_matrix = () => [1n, 0n, 0n, 1n]

/**
@param {matrix2x2<bigint>} A
@param {matrix2x2<bigint>} B
@return {matrix2x2<bigint>}
*/
const matrix_multiply = (A, B) => [
	A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
	A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]
]

/**@param {matrix2x2<bigint>} A*/
const matrix_square = A => matrix_multiply(A, A)

/**
@template {numeric} T
@param {T} x
*/
export const nthFib = x => {
	const [x_sgn, x_abs] = signabs(x)

	//https://en.wikipedia.org/wiki/Generalizations_of_Fibonacci_numbers#Extension_to_negative_integers
	if (typeof x_abs != 'bigint') return round(PHI ** x_abs / SQRT5) * (x_sgn == -1 && x_abs % 2 == 0 ? -1 : 1)

	const e = !(x_abs & 1n)
	if (x_abs < 2n) return x_abs
	//https://en.wikipedia.org/wiki/Fibonacci_number#Matrix_form
	/**
	Fib matrix
	@type {matrix2x2<bigint>}
	*/
	let A = [1n, 1n, 1n, 0n]
	let B = identity_matrix()

	let x_uint = /**@type {bigint}*/(x_abs)
	do {
		if (x_uint & 1n) B = matrix_multiply(B, A)
		x_uint >>= 1n
		A = matrix_square(A)
	} while (x_uint > 1n)
	return matrix_multiply(A, B)[1] * (x_sgn && e ? -1n : 1n)
}

/**
get index of a Fib
@param {number} x
*/
export const invFib = x => {
	const
		[x_sgn, x_abs] = signabs(x),
		i = floor(logB(x_abs * SQRT5 + 0.5, PHI))
	return !(i % 2) && x_sgn == -1 ? NaN : i * x_sgn
}

/**
@template {boolean} T
@param {T} x
*/
export const iterFib = function* (x) {
	let
		a = /**@type {T extends true ? number : bigint}*/(x ? 0 : 0n),
		b = /**@type {T extends true ? number : bigint}*/(x ? 1 : 1n)
	while (true) {
		yield a;
		//@ts-ignore
		[a, b] = [b, a + b]
	}
}

/**
@template {numeric} T
@param {T} a
@param {T} b
@param {boolean[]} ops
@see https://en.wikipedia.org/wiki/Random_Fibonacci_sequence
*/
export const iter_custom_Fib = function* (a, b, ops) {
	let i = 0
	while (true) {
		yield a
		const len = ops.length
		const op = len ? ops[i] : Math.random() < 0.5
		i = (i + 1) % len;
		//@ts-ignore
		[a, b] = [b, op ? b + a : b - a]
	}
}

/**
co-recursive Lucas fn

@param {numeric} P
@param {numeric} Q
@param F if falsy (default) then "U", else "V"
@see https://en.wikipedia.org/wiki/Lucas_sequence
*/
export const Lucas = function* (P = 1, Q = -1, F = false) {
	//@ts-ignore
	const n0 = /**@type {numeric}*/(P ^ P ^ Q ^ Q) // throw early when values are not same-type
	//@ts-ignore
	const n1 = n0 ** n0
	const n2 = n1 + n1

	let [a, b] = F ? [n2, P] : [n0, n1]
	while (true) {
		yield a;
		//@ts-ignore
		[a, b] = [b, P * b - Q * a]
	}
}
