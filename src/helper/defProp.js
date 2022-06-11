/**
Short edition of `defineProperty`
@function defProp
@param {object} O
@param {PropertyKey} p
@param {*} v value to set
@param {(boolean[]|numeric|string)} a bool descriptor with format [W, E, C]
*/
export default defProp = (O, p, v, a) => {
	switch (typeof a) {
		case 'number': a &= 7; a = [a & 4, a & 2, a & 1]; break
		case 'bigint': a &= 7n; a = [a & 4n, a & 2n, a & 1n]; break
		case 'string': a = [/w/i.test(a), /e/i.test(a), /c/i.test(a)]; break
		//Linux chmod lol (rwx)
	}
	return Object.defineProperty(O, p, {value: v,
		writable: !!a[0], enumerable: !!a[1], configurable: !!a[2]})
}