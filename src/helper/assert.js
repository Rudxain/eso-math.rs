export const AssertionError = class extends Error {constructor(m) {super(m)}}
const assert = function(c, m) {if (!c) throw new AssertionError(m)}
export default assert