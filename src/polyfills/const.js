import {TAU, SQRT5, PHI, MAX64} from '../lib/const'

//https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/lang/Double.html#MIN_NORMAL
Number.MIN_NORMAL = 2 ** -1022
Math.TAU = TAU
Math.SQRT5 = SQRT5
Math.PHI = PHI

IntN.MAX_UINT64 = MAX64; IntN.MAX_INT64 = MAX64 >> 1n; IntN.MIN_INT64 = -1n << 63n

export {Number, BigInt, Math}