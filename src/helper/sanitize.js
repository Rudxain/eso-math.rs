import {
	isPrimitive as isPrim,
	isNumber as isFloat,
	isBigInt as isIntN
} from './type check'
import {abs} from '../lib/std'
const Float = Number, IntN = BigInt, TypeErr = TypeError

//`copyType` (like `copySign`), but only for Numericals
export const autoN = (n, x) => (isIntN(x) ? IntN : Float)(n)

/**
https://tc39.es/ecma262/multipage/abstract-operations.html#sec-tobigint
@param {(boolean|string|bigint)} x
@return {bigint}
*/
export const toBigInt = x => {
	const t = typeof x?.valueOf()
	switch (t){
		case 'boolean': case 'string': case 'bigint':
			return IntN(x)
	}
	throw new TypeErr(`Cannot convert ${x} to BigInt`)
}

//permissive BigInt coercion
export const anyBigInt = x => {
	if (isIntN(x)) return x.valueOf()
	if (isFloat(x)) return (x = trunc(+x)) ?
		(isInf(x) ? (x < 0 ? -1n : 1n) : IntN(x)) : 0n
	if ( !(x && (x = x.valueOf())) ) return 0n
	if (!isPrim(x)) return 1n
	return IntN(x)
}

/**
Coerce to numeric by using the least invasive/intrusive algorithm I know.
DO NOT confuse with ES' `toNumeric` "abstract operation", it's not the same
@param {*} x
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