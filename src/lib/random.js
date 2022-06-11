const RNG = Math.random
//returns a pseudorandom signed "Safe Integer"
export const safeInt = () => {
	//we need 54 bits, so only 2 calls are needed
	const b = RNG() * 4 | 0
	return RNG() * (b & 2 ? -2 : 2) ** 53 + (b & 1)
}
export const int32 = () => {return RNG() * 2 ** 32 | 0}
export const range = (min, max) => RNG() * (max - min) + +min //[min, max)