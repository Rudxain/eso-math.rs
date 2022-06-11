export const isPrimitive = x => x === null || !(typeof x == 'object' || typeof x == 'function'),
//ensure `x` can be operated as numeric, regardless if it's object-wrapped or not
	isNumber = x => typeof x?.valueOf() == 'number',
	isBigInt = x => typeof x?.valueOf() == 'bigint',
	isNumeric = x => isNumber(x) || isBigInt(x)