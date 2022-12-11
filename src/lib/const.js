import {M as nthMersenne} from './Mersenne'

export const
	/** 2pi */
	TAU = Math.PI * 2,
	SQRT5 = 5 ** 0.5,
	/** The Golden Ratio */
	PHI = SQRT5 / 2 + 0.5,
	/** maximum 64bit unsigned int */
	MAX64 = nthMersenne(0x40n)

/** sum of inverse `pow`s of itself */
export const invPowSum = (() => {
	let i = 0, out = 0, tmp
	while (out !== tmp) {
		tmp = out
		out += out ** (-i)
		i++
	}
	return out
})()
