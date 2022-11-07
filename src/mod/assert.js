export const AssertionError = class extends Error {constructor(message) {super(message)}}

/**
ensure that a predicate that's supposed to always be `true` is, in fact, `true`
@param {boolean} condition condition to check
@param {string} [msg] error `message`, in case it goes wrong
*/
const assert = function(condition, msg) {if (!condition) throw new AssertionError(msg)}
//defined as regular fn, for better debugability

export default assert