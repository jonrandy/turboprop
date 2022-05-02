const pickoConcatMethod = Symbol('method')
const pickoBase = Symbol('base')

const defaultTargets = [
	[String.prototype, (str,i) => str+i, ''],
	[Array.prototype, (arr, i) => [...arr, i], []]
]

export default function picko(source=[], targets=defaultTargets) {

	source[Symbol.toPrimitive] = function() {
		const keys = this
		const tempSym = Symbol()
		const pickKeys = function () {
			const ret = keys.reduce((all, key) => {
				return this[pickoConcatMethod](all, this[key])
			}, this[pickoBase])
			targets.forEach(([target]) => {
				delete target[tempSym]
			})
			return ret
		}
		targets.forEach(([target, concatMethod, base]) => {
			Object.defineProperty(target, tempSym, { configurable: true, get:pickKeys})
			target[pickoConcatMethod] = concatMethod
			target[pickoBase] = base
		})
		return tempSym
	}

	return source

}