import {PHI, MAX64} from '../lib/const'

const IntN = BigInt

/**https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/lang/Double.html#MIN_NORMAL*/
Number.MIN_NORMAL = 2 ** -1022
Math.TAU = 2 * Math.PI
Math.SQRT5 = Math.sqrt(5)
Math.PHI = PHI

IntN.MAX_UINT64 = MAX64
IntN.MAX_INT64 = MAX64 >> 1n
IntN.MIN_INT64 = -1n << 63n

export {Number, BigInt, Math}