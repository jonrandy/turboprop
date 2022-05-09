const
	turbopropConcatMethod = Symbol('method'),
	turbopropBase = Symbol('base'),
	turbopropMarker = Symbol('turboprop')

const defaultTargets = [
	[String.prototype, '', (str, i) => str+i],
	[Array.prototype, [], (arr, i) => [...arr, i]],
	[Object.prototype, {}, (obj, i, key) => ({...obj, [key]:i})]
]

export default function turboprop(source=[], targets=defaultTargets) {

	if (!Array.isArray(source)) source = [source]

	source[turbopropMarker] = true
	source[Symbol.toPrimitive] = function () {
		const keys = this
		const tempSym = Symbol()
		const get = function () {
			const ret = keys.reduce((all, key) => {
				if (Array.isArray(key) && !isTurbopropArray(key)) key = turboprop(key) // Will also need to check here if global turboprop is switched on - if so, don't do this
				return this[turbopropConcatMethod](all, this[key], key)
			}, this[turbopropBase])
			targets.forEach(([target]) => {
				delete target[tempSym]
			})
			return ret
		}
		const set = function (values) {
			keys.forEach((key, i) => {
				this[key] = values[i]
			})
			targets.forEach(([target]) => {
				delete target[tempSym]
			})
		}
		targets.forEach(([target, base, concatMethod]) => {
			Object.defineProperty(target, tempSym, { configurable: true, get, set})
			target[turbopropConcatMethod] = concatMethod
			target[turbopropBase] = base
		})
		return tempSym
	}

	return source

}

const isTurbopropArray = toCheck => toCheck[turbopropMarker]