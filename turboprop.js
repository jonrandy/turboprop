const
	TURBOPROP_MARKER = Symbol('turboprop')
	

const
	TARGET_STRING = {
		object: String.prototype,
		methods: {
			getter: (keys, str) => keys.reduce((newStr, key) => newStr + str[key], ''),
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
 
const DEFAULT_TARGETS = [ TARGET_STRING, TARGET_ARRAY, TARGET_OBJECT ]

export default function turboprop(source = [], targets = DEFAULT_TARGETS) {

	const TURBOPROP_METHODS = Symbol('turboprop_methods')

	if (!Array.isArray(source)) source = [source]
	source[TURBOPROP_MARKER] = true

	source[Symbol.toPrimitive] = function () {

		const
			keys = this.map(key => (Array.isArray(key) && !isTurbopropArray(key)) ? turboprop(key, targets) : key),
			tempSym = Symbol('turboprop_singleUseMethod'),
			removeTempSymbols = () => targets.forEach(({object}) => {
				delete object[tempSym]
				delete object[TURBOPROP_METHODS]
			}),
			get = function () {
				const ret = this[TURBOPROP_METHODS].getter(keys, this)
				removeTempSymbols()
				return ret
			},
			set = function (values) {
				this[TURBOPROP_METHODS].setter && this[TURBOPROP_METHODS].setter(keys, values, this)
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

export const isTurbopropArray = toCheck => toCheck[TURBOPROP_MARKER]

export const useGlobally = (state = true, targets = DEFAULT_TARGETS) => {
	if (state) {
		turboprop(Array.prototype, targets)
	} else {
		delete Array.prototype[Symbol.toPrimitive]	
	}
}

useGlobally()
