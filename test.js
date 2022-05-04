{
	const b = IntN.asIntN(0x40, IntN.random()), e = IntN.random(0xffn), m = IntN.asIntN(0x40, IntN.random()),
		F = ['euclid', 'floor', 'trunc', 'ceil', 'round', 'roundInf'][trunc(random01() * 6)];
	assert(IntN.modPow(b, e, m, F) == IntN.mod(b ** e, m, F), 'wrong modular exponentiation')
}