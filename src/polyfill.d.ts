interface NumberConstructor {
	/**
     * The value of the smallest normalized number.
     * The value of Number.MIN_NORMAL is 2.2250738585072014e-308 (2^-1022).
     */
	readonly MIN_NORMAL: number

	/**
     * Returns true if the value passed is a safe number.
     * @param number A numeric value.
     */
    isSafeNumber(number: unknown): boolean;
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

	/**
     * Returns the base y logarithm of a number.
     * @param x A numeric expression.
     */
    logB(x: number): number;
}

interface BigIntConstructor {
	/**
     * The value of the largest unsigned integer that fits in a 64bit register.
     * The value of BigInt.MAX_UINT64 is 18446744073709551615n (2^64 − 1).
     */
	readonly MAX_UINT64: bigint

	/**
     * The value of the largest signed integer that fits in a 64bit register.
     * The value of BigInt.MAX_INT64 is 9223372036854775807n (2^63 − 1).
     */
	readonly MAX_INT64: bigint
	/**
     * The value of the smallest signed integer that fits in a 64bit register.
     * The value of BigInt.MAX_INT64 is 9223372036854775807n (-(2^63)).
     */
	readonly MIN_INT64: bigint
}