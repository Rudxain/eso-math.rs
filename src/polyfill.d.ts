interface NumberConstructor {
	/**
     * The value of the smallest normalized number.
     * The value of Number.MIN_NORMAL is 2.2250738585072014e-308 (2^-1022).
     */
	readonly MIN_NORMAL: number
}

interface Math {
	/** Tau. This is the ratio of the circumference of a circle to its radius. */
	readonly TAU: number
	/** The square root of 5. */
    readonly SQRT5: number
	/**
	 * The mathematical constant Phi. This is the Golden Ratio, the principal root of x^2 - x - 1 = 0.
	 * Its value is 1 plus the square root of 5, divided by 2.
	 * Equal to approximately 1.618033988749895 ((1 + sqrt(5)) / 2).
	 */
	readonly PHI: number
}