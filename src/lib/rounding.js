import { isInt, isInfNaN } from '../mod/value check'
import { abs } from './std'

/**
round towards `0`
@template {numeric} T
@param {T} x
@return {T}
*/
export const trunc = x => isInt(x) ? x : x - x % 1

/**
round towards `-Infinity`
@template {numeric} T
@param {T} x
@return {T}
*/
export const floor = x => isInt(x) ? x : trunc(x) - (x < 0 ? 1 : 0)

/**
round towards `+Infinity`
@template {numeric} T
@param {T} x
@return {T}
*/
export const ceil = x => isInt(x) ? x : trunc(x) + (x > 0 ? 1 : 0)

/**
round towards nearest int
@template {numeric} T
@param {T} x
@return {T}
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
@template {numeric} T
@param {T} x
@return {T}
*/
export const expand = x => (x < 0 ? floor : ceil)(x)