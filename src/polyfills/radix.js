import {isNumber as isFloat} from '../helper/type check'
import {isInfNaN} from '../helper/value check'
import {abs, sign, logB} from '../lib/std'
import {trunc} from '../lib/rounding'

const Float = Number, IntN = BigInt, Str = String, _Map = Map,
	TypeErr = TypeError, RangeErr = RangeError

//Scientific Notation in base B
defProp(Number.prototype, 'toScientific', function toScientific(b = 10) {
	let x = this?.valueOf()
	//JIC someone uses the `call` method
	if (!isFloat(x)) throw new TypeErr('Number.prototype.toScientific requires that `this` be a Number')
	x = Float(x)
	b = Float(b)
	let e
	if (!isInfNaN(x)) {e = x && trunc(logB(abs(x), b)); x /= b ** e}
	else {e = x; x = sign(x)}
	return x.toString(b) + ` * 10^${e.toString(b)} (base 0d${b})`
}, 0b101)

export {Number, BigInt}