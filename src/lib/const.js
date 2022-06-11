import {M as nthMersenne} from './Mersenne'

const {PI, E} =  Math
export const TAU = PI * 2,
	SQRT5 = 5 ** 0.5,
	/**@const {number} The Golden Ratio*/
	PHI = SQRT5 / 2 + 0.5,
	/**@const {bigint} maximum 64bit unsigned int*/
	MAX64 = nthMersenne(0x40n)
/**
@const {bigint}
Largest known Mersenne Prime exponent.
Yes, the unpacked numeral fits in memory. It's just ~10MB, but ~30MB as decimal string.
To "unpack" it use: `nthMersenne(MAX_MP_EXP)`
*/
export const MAX_MP_EXP = 82_589_933n