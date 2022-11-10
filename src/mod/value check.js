import '../typedefs'

/**
check if primitive integer

this is not future proof:
if `BigFloat`s are added, this will return `false` for any of them
@type {{
	(x: bigint): true;
	(x: number): boolean;
	(x: unknown): false;
}}
@param {unknown} x
*/
export const isInt = x => (typeof x == 'number' && x % 1 == 0) || typeof x == 'bigint'

/**
check if either `Infinity` sign
@type {{
	(x: number): boolean;
	(x: unknown): false;
}} there's no `+-Infinity` literals: https://github.com/microsoft/TypeScript/issues/32277
@param {unknown} x
*/
export const isInf = x => x === +Infinity || x === -Infinity

/**
same as `Number.isNaN` but with richer type checking
@type {{
	(x: number): boolean;
	(x: unknown): false;
}} there's no `NaN` literal: https://github.com/microsoft/TypeScript/issues/32277
@param {unknown} x
*/
//eslint-disable-next-line no-self-compare
export const isNAN = x => typeof x == 'number' && x != x

/**
check if either `Infinity` or `NaN`
@type {{
	(x: number): boolean;
	(x: unknown): false;
}}
@param {unknown} x
*/
export const isInfNAN = x => isInf(x) || isNAN(x)

/**
check if signed/negative/minus zero `-0`

unlike `Object.is`, this fn is 100% pure
@type {{
	(x: -0): boolean;
	(x: unknown): false;
}} since `-0` and `0` are considered equal by TS, we can't just use `true`
@param {unknown} x
*/
export const isNegZero = x => x === 0 && 1 / x == -Infinity

/**
check if it has a sign (includes `-0`)
@param {numeric} x
*/
export const isSigned = x => x < 0 || isNegZero(x)