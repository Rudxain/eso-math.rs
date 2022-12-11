import * as con from './lib/const'
import * as std from './mod/std'
import * as mean from './lib/mean'
import * as round from './lib/rounding'
import * as fac from './lib/factorial'
import * as facts from './mod/factors'
import * as rdx from './lib/radix'
import * as bit_cast from './mod/bit cast'
import * as bitwise from './mod/bitwise'
import * as m from './lib/Mersenne'
import * as rng from './lib/random'
import * as wave from './lib/waveform'
import * as rt from './lib/root'
import * as pow from './lib/power'
import * as hyper from './lib/hyper'
import * as drt from './lib/digit root'
import * as dec from './lib/decay'
import * as tri from './lib/triangular'
import * as pron from './lib/pronic'
import * as luke from './lib/Lucas'
import * as coll from './lib/Collatz'
import * as ve from './lib/Van Eck'

//is there a better way to do this?
const modules = [
	con,
	std,
	mean,
	round,
	fac,
	facts,
	rdx,
	bit_cast,
	bitwise,
	m,
	rng,
	wave, //is this sorted nicely?
	rt,
	pow,
	hyper,
	drt,
	dec,
	tri,
	pron,
	luke,
	coll,
	ve
]

const EsoMath = {}
for (const O of modules)
	Object.assign(EsoMath, O)
export default EsoMath
