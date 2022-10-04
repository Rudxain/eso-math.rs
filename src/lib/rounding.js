import { isInt, isInfNaN } from '../helper/value check'
import { abs } from './std'

/**
round towards `0`
@param {numeric} x
@return {numeric}
*/
export const trunc = x => isInt(x) ? x : x - x % 1

/**
round towards `-Infinity`
@param {numeric} x
@return {numeric}
*/
export const floor = x => isInt(x) ? x : trunc(x) - (x < 0 ? 1 : 0)

/**
round towards `+Infinity`
@param {numeric} x
@return {numeric}
*/
export const ceil = x => isInt(x) ? x : trunc(x) + (x > 0 ? 1 : 0)

/**
round towards nearest int
@param {numeric} x
*/
export const round = x =>
	isInt(x) || isInfNaN(x)
		? x
		: x < 0 && x >= -0.5
			? -0
			: abs(x) % 1 < 0.5
				? floor(x)
				: ceil(x)
/**
round towards unsigned (any) `Infinity`.
"complement" of `trunc`.
@param {numeric} x
*/
export const expand = x => (x < 0 ? floor : ceil)(x)