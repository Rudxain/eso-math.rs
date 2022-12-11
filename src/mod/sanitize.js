import '../typedefs'
import {
	isPrimitive as isPrim,
	isNumber as isFloat,
	isBigInt as isIntN
} from './type check'
import { isInf } from './value check'
import { abs } from './std'
import { trunc } from '../lib/rounding'

const
	Float = Number,
	IntN = BigInt,
	Str = String,
	TypeErr = TypeError

/**{@link Number.MAX_SAFE_INTEGER}*/
const MAX_SAFE_INT = /**@type {9007199254740991}*/(Float.MAX_SAFE_INTEGER)

/**
`copyType` (like `copySign`), but only for Numericals.
This is like type-inference

@template {numstr|boolean} N
@template {numeric} T
@param {N} n value to coerce
@param {T} x from which the type is copied
*/
export const autoN = (n, x) => /**@type {T}*/((typeof x == 'bigint' ? IntN : Float)(n))

/**
https://tc39.es/ecma262/multipage/abstract-operations.html#sec-tobigint
@template {boolean|string|bigint} T
@param {T} x
*/
export const toBigInt = x => {
	switch (typeof x?.valueOf?.()) {
		case 'boolean': case 'string': case 'bigint':
			return IntN(x)
		default:
			throw new TypeErr(`Cannot convert ${x} to BigInt`)
	}
}

/**
permissive BigInt coercion
@template T
@param {T} x value to coerce
@return {bigint}
*/
export const anyBigInt = x => {
	if (isIntN(x)) return IntN(/**@type {bigint}*/(x))
	if (isFloat(x)) {
		const n = trunc(+x)
		return n != 0 ? (isInf(n) ? (n < 0 ? -1n : 1n) : IntN(n)) : 0n
	}
	const v = x?.valueOf?.()
	if (!(x && v)) return 0n
	if (!isPrim(v)) return 1n
	return IntN(/**@type {string|true}*/(v))
}

/**
Coerce to numeric by using the least invasive/intrusive algorithm I know.
DO NOT confuse with ES' `toNumeric` "abstract operation", it's not the same.
@template T
@param {T} x value to coerce
@return {numeric}
*/
export const toNumeric = x => {
	if (isFloat(x)) return +x
	if (isIntN(x)) return IntN(/**@type {bigint}*/(x))
	if (x === null) return 0

	let v = x?.valueOf?.()
	if (v === undefined || typeof v == 'symbol')
		return NaN

	if (!isPrim(v)) v = Str(v)

	if (!+v || abs(+v) <= MAX_SAFE_INT ||
		//I know /\s/ exists, but `trim` is faster and more readable
		/^[-+]?Infinity$/.test(Str(v).trim())) return +v
	return IntN(typeof v == 'string' && v.includes('.') ? v.substring(0, v.indexOf('.')) : /**@type {string|boolean}*/(v))
}