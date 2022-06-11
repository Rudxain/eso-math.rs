import {abs} from '../lib/std'
import {Number} from './const'

Number.isSafeNumber = function(number) {
	return typeof number == 'number' &&
		abs(number) >= Number.MIN_NORMAL &&
		abs(number) <= Number.MAX_SAFE_INTEGER
}
export {Number}