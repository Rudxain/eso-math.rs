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

//https://tc39.es/ecma262/multipage/global-object.html#sec-parseint-string-radix
BigInt.parse = function(string, radix) {
	string = Str(string).trimStart().toLowerCase()
	let sign = 1n
	if (string) {
		switch (string[0]) {
			case '-': sign = -1n
			case '+': string = string.substring(1)
		}
	}
	let stripPrefix = true
	if (radix = Float(radix) | 0) {
		if (radix < 2 || radix > 36) throw new RangeErr('Invalid base')
		if (radix != 0x10) stripPrefix = false
	}
	else radix = 10;

	if (stripPrefix &&
		string.length >= 2 &&
		string[0] == '0' &&
		string[1] == 'x')
		{string = string.substring(2); radix = 0x10}

	const charset = new _Map
	for (let i = 0n; i < radix; i++)
		charset.set('0123456789abcdefghijklmnopqrstuvwxyz'[i], i)

	let end = -1
	while (++end < string.length)
		if (!charset.has(string[end])) break

	string = string.substring(0, end)
	let int = 0n
	if (!string) return int //no need to throw, 0 fits better
	radix = IntN(radix); end = IntN(end)
	//DO NOT REVERSE iteration order
	for (let i = end - 1n; i >= 0; i--)
		int += charset.get(string[end - i - 1n]) * radix ** i
	return sign * int
}

export {Number, BigInt}