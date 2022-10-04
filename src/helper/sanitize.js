import '../typedefs'
import {
	isPrimitive as isPrim,
	isNumber as isFloat,
	isBigInt as isIntN
} from './type check'
import { isInf } from './value check'
import { abs } from '../lib/std'
import { trunc } from '../lib/rounding'

const Float = Number, IntN = BigInt, Str = String, TypeErr = TypeError

/**
`copyType` (like `copySign`), but only for Numericals
@param {any} n value to coerce
@param {numeric} x from which the type is copied
@return {numeric}
*/
export const autoN = (n, x) => (isIntN(x) ? IntN : Float)(n)

/**
https://tc39.es/ecma262/multipage/abstract-operations.html#sec-tobigint
@param {(boolean|string|bigint)} x
*/
export const toBigInt = x => {
	switch (typeof x?.valueOf()) {
		case 'boolean': case 'string': case 'bigint':
			return IntN(x)
		default:
			throw new TypeErr(`Cannot convert ${x} to BigInt`)
	}
}

/**
permissive BigInt coercion
@param {*} x value to coerce
@return {bigint}
*/
export const anyBigInt = x => {
	if (isIntN(x)) return x.valueOf()
	if (isFloat(x)) {
		x = trunc(+x)
		return x != 0 ? (isInf(x) ? (x < 0 ? -1n : 1n) : IntN(x)) : 0n
	}
	if (!(x && (x = x.valueOf()))) return 0n
	if (!isPrim(x)) return 1n
	return IntN(x)
}

/**
Coerce to numeric by using the least invasive/intrusive algorithm I know.
DO NOT confuse with ES' `toNumeric` "abstract operation", it's not the same
@param {*} x value to coerce
@return {numeric}
*/
export const toNumeric = x => {
	if (isFloat(x)) return +x; if (isIntN(x)) return IntN(x)
	if (x === null) return 0
	if (x === undefined || typeof (x = x.valueOf()) == 'symbol') return NaN
	if (!isPrim(x)) x = Str(x)
	if (!+x || abs(+x) < 2 ** 53 ||
		//I know /\s/ exists, but `trim` is faster and more readable
		/^[-+]?Infinity$/.test(Str(x).trim())) return +x
	return IntN(typeof x == 'string' && x.includes('.') ? x.substring(0, x.indexOf('.')) : x)
}