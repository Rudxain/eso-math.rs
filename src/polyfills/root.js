import {toBigInt} from '../mod/sanitize'
import {root, sqrt} from '../lib/root'

Math.root = function(x, y = 2) {return root(+x, +y)}
IntN.root = function(n, i = 2n) {return root(toBigInt(n), toBigInt(i))}

BigInt.sqrt = function(n) {return sqrt(toBigInt(n))}

export {BigInt}