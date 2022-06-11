import * as std from './lib/std'
import * as round from './lib/rounding'
import * as bit from './lib/bitwise'
import * as rand from './lib/random'

/**
any strictly numerical value
@typedef {(number|bigint)} numeric
*/

const EsoMath = {}
for (const O of [std, round, bit, rand])
	Object.assign(EsoMath, O)
export default EsoMath