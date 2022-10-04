import * as con from './lib/const'
import * as std from './lib/std'
import * as mean from './lib/mean'
import * as round from './lib/rounding'
import * as fac from './lib/factorial'
import * as facts from './lib/factors'
import * as bit_cast from './lib/bit cast'
import * as bitwise from './lib/bitwise'
import * as m from './lib/Mersenne'
import * as rng from './lib/random'
import * as pow from './lib/power'
import * as hyper from './lib/hyper'
import * as drt from './lib/digit root'
import * as dec from './lib/decay'
import * as pron from './lib/pronic'
import * as luke from './lib/Lucas'
import * as coll from './lib/Collatz'

//is there a better way to do this?
const modules = [
	con,
	std,
	mean,
	round,
	fac,
	facts,
	bit_cast,
	bitwise,
	m,
	rng,
	pow,
	hyper,
	drt,
	dec,
	pron,
	luke,
	coll
]

const NTML = {}
for (const O of modules)
	Object.assign(NTML, O)
export default NTML
