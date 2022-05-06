const
	pickoConcatMethod = Symbol('method'),
	pickoBase = Symbol('base'),
	pickoMarker = Symbol('picko')

const defaultTargets = [
	[String.prototype, '', (str, i) => str+i],
	[Array.prototype, [], (arr, i) => [...arr, i]],
	[Object.prototype, {}, (obj, i, key) => ({...obj, [key]:i})]
]

export default function picko(source=[], targets=defaultTargets) {

	if (!Array.isArray(source)) source = [source]

	source[pickoMarker] = true
	source[Symbol.toPrimitive] = function() {
		const keys = this
		const tempSym = Symbol()
		const pickKeys = function () {
			const ret = keys.reduce((all, key) => {
				if (Array.isArray(key) && !isPicko(key)) key = picko(key) // Will also need to check here if global picko is switched on - if so, don't do this
				return this[pickoConcatMethod](all, this[key], key)
			}, this[pickoBase])
			targets.forEach(([target]) => {
				delete target[tempSym]
			})
			return ret
		}
		targets.forEach(([target, base, concatMethod]) => {
			Object.defineProperty(target, tempSym, { configurable: true, get:pickKeys})
			target[pickoConcatMethod] = concatMethod
			target[pickoBase] = base
		})
		return tempSym
	}

	return source

}

const isPicko = toCheck => toCheck[pickoMarker]