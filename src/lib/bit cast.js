const IntNArr = BigUint64Array, FloatArr = Float64Array
/**
get the internal bits (binary64 IEEE 754 representation)
@param {number} f
*/
export const F64_to_I64 = f => new IntNArr(new FloatArr([f]).buffer)[0]

/**
mask the 64 LSBs and read as IEEE-754 binary64 floating-point format
@param {bigint} n
*/
export const I64_to_F64 = n => new FloatArr(new IntNArr([n]).buffer)[0]