import defProp from '../helper/defProp'
//I have no idea if this is correct
import {Math, BigInt} from './std'
import {Math, BigInt} from './factorial'
import {Math, BigInt} from './factors'
import {BigInt} from './hypot'

//correction of data descriptors, to make everything equal to vanilla JS
for (const O of [Number, Math, BigInt])
	//`for in` is slower and has more potential side-effects
	for (const k of Object.keys(O)) {
		const isF = typeof O[k] == 'function'
		defProp(O, k, O[k], +isF && 0b101)
		if (isF) defProp(O[k], 'name', O[k].name || k, 1) //name all anonymous funcs
	}

console.log(Math.factorial)
export {Number, Math, BigInt}