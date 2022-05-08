const
	multipropConcatMethod = Symbol('method'),
	multipropBase = Symbol('base'),
	multipropMarker = Symbol('multiprop')

const defaultTargets = [
	[String.prototype, '', (str, i) => str+i],
	[Array.prototype, [], (arr, i) => [...arr, i]],
	[Object.prototype, {}, (obj, i, key) => ({...obj, [key]:i})]
]

export default function multiprop(source=[], targets=defaultTargets) {

	if (!Array.isArray(source)) source = [source]

	source[multipropMarker] = true
	source[Symbol.toPrimitive] = function () {
		const keys = this
		const tempSym = Symbol()
		const get = function () {
			const ret = keys.reduce((all, key) => {
				if (Array.isArray(key) && !isMultipropArray(key)) key = multiprop(key) // Will also need to check here if global multiprop is switched on - if so, don't do this
				return this[multipropConcatMethod](all, this[key], key)
			}, this[multipropBase])
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
			target[multipropConcatMethod] = concatMethod
			target[multipropBase] = base
		})
		return tempSym
	}

	return source

}

const isMultipropArray = toCheck => toCheck[multipropMarker]