import '../typedefs'
import { isInt, isNegZero } from './value-check'
import { autoN } from './sanitize'
import { trunc, floor } from '../lib/rounding'

const IntN = BigInt, lb = Math.log2

export class AssertionError extends Error {
	constructor(msg = "") {
		super(msg);
		this.name = AssertionError.name;
	}
}

/**
{@link https://es.discourse.group/t/error-assert/356}
*/
export function assert(p: boolean, msg = ""): asserts p {
	if (!p) throw new AssertionError(msg);
}

/**
absolute value
*/
export function abs(x: number): number
export function abs(x: bigint): bigint
export function abs(x: numeric): numeric
export function abs(x: numeric) {
	return (x < 0 || isNegZero(x) ? -x : x)
}
export function sign(x: number): -1 | -0 | 0 | 1 | typeof NaN
export function sign(x: bigint): -1n | 0n | 1n
export function sign(x: numeric): -1 | -1n | -0 | 0 | 0n | 1 | 1n | typeof NaN
export function sign(x: numeric) {
	return x == 0 ? autoN(0, x as 0 | 0n) : (x < 0 ? autoN(-1, x) : autoN(1, x))
}
/**
get a 2-tuple with both the sign and absolute value of `x`. similar to `divrem`
*/
export const signabs = (x: numeric) => [sign(x), abs(x)]

/**
calculate truncated division with remainder, returning both values in a 2-tuple
*/
export function divrem(n: number, d: number): [number, number]
export function divrem(n: bigint, d: bigint): [bigint, bigint]
export function divrem(n: numeric, d: numeric) {
	//@ts-expect-error
	return [trunc(n / d), n % d]
}

/**
calculate Euclidean division with remainder, returning both values in a 2-tuple.

Currently, this is incorrect for `BigInt`s
*/
export function logB(x: number, b: number): number
export function logB(x: bigint, b: bigint): numeric
export const divEuclid = (n, d) =>
	(floor(n / abs(d)) * sign(d))

export const isEven = (x: unknown) =>
	isInt(x) && x % autoN(2, x) == 0

export const isOdd = (x: unknown) =>
	isInt(x) && x % autoN(2, x) != 0

export function clamp(x: number, min: number, max: number): number
export function clamp(x: bigint, min: bigint, max: bigint): bigint
export function clamp(x: string, min: string, max: string): string
export function clamp(x: numstr, min: numstr, max: numstr) {
	return x > max ? max : x < min ? min : x
}

/**
Logarithm in any base
*/
export function logB(x: number, b: number): number
export function logB(x: bigint, b: bigint): numeric
export function logB(x: numeric, b: numeric): numeric {
	if (x < 0 || b == 0 || b == 1) return NaN
	if (x == 0) return -Infinity
	if (x == 1) return autoN(0, x)
	if (typeof x == 'number')
		// in general,
		// `lb` has better precision and performance
		// than `ln`
		return lb(x) / lb(b as number)

	let i = 0n
	while ((x as bigint) /= (b as bigint))
		i++
	return i
}
