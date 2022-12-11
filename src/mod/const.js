import { M as nthMersenne } from "../lib/Mersenne"

/** 2pi */
export const TAU = Math.PI * 2

export const
	SQRT5 = 5 ** 0.5,
	/** The Golden Ratio */
	PHI = SQRT5 / 2 + 0.5

/** maximum 64bit unsigned int */
export const MAX64 = nthMersenne(0x40n)

/**
bit length of IEEE-754 binary64 float significand.

also the max entropy of {@link Math.random}
*/
export const MANTISSA_SIZE = 52