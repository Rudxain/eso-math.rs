import '../typedefs'
import { is_numeric } from './type check'

/**
check if primitive integer

this is not future proof:
if `BigFloat`s are added, this will return `false` for any of them
*/
export function isInt(x: bigint): true
export function isInt(x: unknown): boolean
export function isInt(x: unknown) {
	return (typeof x == 'number' && x % 1 == 0) || typeof x == 'bigint'
}

/**
check if either `Infinity` sign
@template T
@param {T} x
*/ //there's no `+-Infinity` literals: https://github.com/microsoft/TypeScript/issues/32277
export const isInf = x => /**@type {T extends number ? boolean : false}*/(
	x === +Infinity || x === -Infinity
)

/**
same as `Number.isNaN` but with richer type checking
@template T
@param {T} x
*/ //there's no `NaN` literal: https://github.com/microsoft/TypeScript/issues/32277
//eslint-disable-next-line no-self-compare
export const isNAN = x => /**@type {T extends number ? boolean : false}*/(
	typeof x == 'number' && x != x
)

/**
check if either `Infinity` or `NaN`
@template T
@param {T} x
*/
export const isInfNAN = x => isInf(x) || isNAN(x)

/**
check if signed/negative/minus zero `-0`

unlike `Object.is`, this fn is 100% pure
@template T
@param {T} x
*/ //since `-0` and `0` are considered equal by TS, we can't just use `true`
export const isNegZero = x => /**@type {T extends -0 ? boolean : false}*/(
	x === 0 && 1 / /**@type {0}*/(x) == -Infinity
)

/**
check if it has a sign (includes `-0`)
@template T
@param {T} x
*/
export const isSigned = x => /**@type {T extends numeric ? boolean : false}*/(
	is_numeric(x) && (x < 0 || isNegZero(x))
)
