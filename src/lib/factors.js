import { autoN } from "../mod/sanitize"
import { abs } from "../mod/std"
import { sqrt } from "../mod/root"

/**
2nd lowest common divisor. the 1st is always `1`
@template {numeric} T
@param {T} a
@param {T} b
*/
export const lcd = (a, b) => {
	a = abs(a)
	b = abs(b)

	const rt = sqrt(a * b), n1 = autoN(1, a)

	for (let i = autoN(2, n1); i <= rt; i++)
		if (!(a % i || b % i)) return i
	return n1
}

/*
to-do: add fn to test if number equals sum of divisors
with the option to include or exclude 1
*/