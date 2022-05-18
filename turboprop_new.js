const
	TURBOPROP_MARKER = Symbol('turboprop'),
	TURBOPROP_METHODS = Symbol('methods')

const
	TARGET_STRING = {
		object: String.prototype,
		methods: {
			getter: (keys, str) => keys.reduce((newStr, key) => newStr + str[key], '')
			setter: false
		}
	},
	TARGET_ARRAY = {
		object: Array.prototype,
		methods: {
			getter: (keys, arr) => keys.reduce((newArr, key) => [...newArr, arr[key]], []),
			setter: (keys, values, arr) => keys.forEach((key, i) => arr[key] = values[i])
		}
	},
	TARGET_OBJECT = {
		object: Object.prototype,
		methods: {
			getter: (keys, arr) => keys.reduce((newArr, key) => [...newArr, arr[key]], []),
			setter: (keys, values, arr) => keys.forEach((key, i) => arr[key] = values[i])
		}
	}
 
const DEFAULT_TARGETS = [
	TARGET_STRING,
	TARGET_ARRAY,
	TARGET_OBJECT
]


export default function turboprop(source = [], targets = DEFAULT_TARGETS) {

	if (!Array.isArray(source)) source = [source]

	source[TURBOPROP_MARKER] = true

	source[Symbol.toPrimitive] = function () {
		const keys = this
		const tempSym = Symbol()
		const removeTempSymbols = () => targets.forEach(({object}) => delete object[tempSym])

		const get = function () {
			// // Do this for all keys before passing
			// if (Array.isArray(key) && !isTurbopropArray(key)) key = turboprop(key) // Will also need to check here if global turboprop is switched on - if so, don't do this
			const ret = this[TURBOPROP_METHODS.getter](keys, this)
			removeTempSymbols()
			return ret
		}

		const set = function (values) {
			this[TURBOPROP_METHODS.setter](keys, values, this)
			removeTempSymbols()
		}

		targets.forEach(({object, methods}) => {
			Object.defineProperty(object, tempSym, { configurable: true, get, set})
			object[TURBOPROP_METHODS] = methods
		})
		return tempSym
	}

	return source

}

const isTurbopropArray = toCheck => toCheck[TURBOPROP_MARKER]