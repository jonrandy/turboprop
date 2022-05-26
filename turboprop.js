const TURBOPROP_MARKER = Symbol('turboprop')
	
export const
	TARGET_STRING = {
		object: String.prototype,
		methods: {
			getter: (indexes, str) => indexes.reduce((newStr, index) => newStr + str[index], ''),
			setter: false
		}
	},
	TARGET_ARRAY = {
		object: Array.prototype,
		methods: {
			getter: (indexes, arr) => indexes.reduce((newArr, index) => [...newArr, arr[index]], []),
			setter: (indexes, values, arr) => indexes.forEach((index, i) => arr[index] = values[i])
		}
	},
	TARGET_OBJECT = {
		object: Object.prototype,
		methods: {
			getter: (keys, obj) => keys.reduce((newArr, key) => [...newArr, obj[key]], []),
			setter: (keys, values, obj) => keys.forEach((key, i) => obj[key] = values[i])
		}
	}
 
const DEFAULT_TARGETS = [ TARGET_STRING, TARGET_ARRAY, TARGET_OBJECT ]

export function initialise(array = [], targetOrTargets = DEFAULT_TARGETS) {

	const TURBOPROP_METHODS = Symbol('turboprop_methods')

	const targets = Array.isArray(targetOrTargets) ? targetOrTargets : [targetOrTargets]

	array[TURBOPROP_MARKER] = true

	array[Symbol.toPrimitive] = function (hint) {

		// retain normal behaviour of array coercion if asked for 'default'
		if (hint === 'default') return this.toString()

		const
			keys = this.map(key => (Array.isArray(key) && !isInitialisedArray(key)) ? initialise(key, targets) : key),
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

	return array

}

export const isInitialisedArray = array => array[TURBOPROP_MARKER]

export const initialiseGlobally = (state = true, targetOrTargets = DEFAULT_TARGETS) => {
	if (state) {
		initialise(Array.prototype, targetOrTargets)
	} else {
		delete Array.prototype[Symbol.toPrimitive]	
	}
}
