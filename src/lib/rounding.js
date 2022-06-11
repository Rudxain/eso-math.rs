import {isInt, isInfNaN} from '../helper/value check'
import {abs} from './std'
export const
	trunc = x => isInt(x) ? x : x - x % 1,
	floor = x => isInt(x) ? x : trunc(x) - (x < 0 ? 1 : 0),
	ceil = x => isInt(x) ? x : trunc(x) + (x > 0 ? 1 : 0),
	round = x => isInt(x) || isInfNaN(x) ? x
		: x < 0 && x >= -0.5 ? -0 : abs(x) % 1 < 0.5 ? floor(x) : ceil(x),
	//"complement" of `trunc`: round towards unsigned (any) Infinity
	expand = x => (x < 0 ? floor : ceil)(x)