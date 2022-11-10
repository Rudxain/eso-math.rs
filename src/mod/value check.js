import '../typedefs'

/**
check if primitive integer

this is not future proof:
if `BigFloat`s are added, this will return `false` for any of them
@param {unknown} x
*/
export const isInt = x => (typeof x == 'number' && x % 1 == 0) || typeof x == 'bigint'

/**
check if either `Infinity` sign
@param {unknown} x
*/
export const isInf = x => x === +Infinity || x === -Infinity

const { isNaN } = Number
/**
check if either `Infinity` or `NaN`
@param {unknown} x
*/
export const isInfNAN = x => isInf(x) || isNaN(x)

/**
check if signed/negative/minus zero `-0`

unlike `Object.is`, this fn is 100% pure
@param {unknown} x
*/
export const isNegZero = x => x === 0 && 1 / x == -Infinity

/**
check if it has a sign (includes `-0`)
@param {numeric} x
*/
export const isSigned = x => x < 0 || isNegZero(x)