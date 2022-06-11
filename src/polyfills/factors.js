import {toBigInt} from '../helper/sanitize'
import {gcd, lcm} from '../lib/factors'

Math.gcd = function(x, y) {return gcd(+x, +y)}
BigInt.gcd = function(a, b) {return gcd(toBigInt(a), toBigInt(b))}

Math.lcm = function(x, y) {return lcm(+x, +y)}
BigInt.lcm = function(a, b) {return lcm(toBigInt(a), toBigInt(b))}

export {Math, BigInt}