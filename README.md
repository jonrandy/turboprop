# Turboprop

Turboprop provides functionality to modify JavaScript arrays so that they can be used as property accessors (both for getting, and setting values). It also lets you define the methods by which the target object's properties are *get* and *set* using the accessor array.

That probably seems a lot like gibberish, so the best way to explain is with some sample code:
```js
// Retrieve multiple values from an array
const arr = ['a', 'b', 'c', 'd', 'e']
console.log(arr[[0, 2, 4]])   // ["a", "c", "e"]

// Nested retrieval
console.log(arr[[0, 2, [3,4]]])   // ["a", "c", ["d", "e"]]

// Setting multiple values in an array
arr[[1, 3, 5]] = ['r', 'h', 's']
console.log(arr)   // ["a", "r", "c", "h", "e", "s"]

// combine getting and setting array values
arr[[0,1]] = arr[[2,0]]
console.log(arr)   // ["c", "a", "c", "h", "e", "s"]


// Retrieve multiple object properties
const obj = {a: 5, b: 6, c: 7, d: 8, e: 9}
console.log(obj[['b', 'c', 'e']])   // [6, 7, 9]

// Set multiple object properties
obj[['a', 'e']] = [33, 66]
console.log(obj)   // { a: 33, b: 6, c: 7, d: 8, e: 66 }


// Retrieve multiple characters from a string
const str = "Hello world!"
console.log(str[[0, 4, 7, 10, 11]])   // 'Hood!'
console.log(str[0[to(3)], 6[to(10)]])   // 'Hell world' (using 'to' from metho-number)

// Strings are immutable - hence no setting

// More useful(?) examples
const addr = "123 High Street, My Town, My State"
const address = {}
address[['line1', 'line2', 'line3']] = addr.split(',').map(s=>s.trim())
console.log(address)   // { line1: "123 High Street", line2: "My Town", line3: "My State" }

const obj1 = {type: 'box', col1: 'red', col2: 'blue', col3: 'green'}
const obj2 = {}
obj2[['item', 'colours']] = obj1[['type', ['col1', 'col2', 'col3']]
console.log(obj2)   // {item: 'box', colours:['red', 'blue', 'green']}

```

If you would like the above standard behaviours to be added to `Array.prototype` - giving ANY array gaining the ability to behave like this with other arrays, objects, and strings - simply call `initialiseGlobally()`.




## Why was this built?

Basically I just wanted to see if it was possible to do it. Ever since I wrote [Metho](https://github.com/jonrandy/metho), I've been churning ideas in my head about what other possibilities would be opened up with similar JS syntax hacking. Turboprop is the first useful(?) thing to come out of the ensuing experiments.



## How it Works

Turboprop works by modifying the type coercion behaviour of an array so that when JS attempts to convert it to a string for the purpose of using it as a property accessor, the following things happen:

* Temporary properties (named with a Symbol to avoid name clashes) are set up on predefined 'target' objects - from which the properties of the target will be accessed
* 'Getter' and 'Setter' methods are defined for these temporary properties. These methods are responsible for retrieving and setting values on the target objects, using the original accessor array in whatever way they choose. After their job is done, they delete the temporary property to avoid clutter
* Instead of returning a string from the coercion, the Symbol that names the temporary property is returned - which causes the relevant 'getter' or 'setter' method to be triggered on the target, carrying out the property retrieval or assignment as appropriate



## Usage

Turboprop defines a few basic functions for its operation:

### `initialiseGlobally([state], [targetOrTargets])`
This is just a convenience function to quickly modify `Array.prototype` so that all arrays can be used as property accessors for the default targets (see below for an explanation of 'targets'). It takes 2 optional parameters:

* `state` - Defaults to true - specifies whether you want to switch functionality on or off
* `targetOrTargets` - Specifies a target, or array of targets that may have their properties accessed by arrays. If not specified, this will default to the default Turboprop targets

**Important note** - because `initialiseGlobally` modifies the prototype of **all** arrays, it is possible (although unlikely) that conflicts with other libraries that do similar can occur. Despite this modification, the standard behaviour or arrays has been preserved as far as possible.

### `initialise([array], [targetOrTargets])`
Turns the passed array into a 'Turboprop' array that can be used as a property accessor for the targets provided (see below for an explanation of 'targets'). It takes 2 optional parameters:

* `array` - The array to convert. Will default to creating an empty array
* `targetOrTargets` - Specifies a target, or array of targets that may have their properties accessed by the array. If not specified, this will default to the default Turboprop targets

The function modifies the passed array, and returns that same array.

### `isInitialisedArray(array)`
Checks if the passed array is already initialised as a 'Turboprop' array. Returns a boolean.console.log(object[property])



## Targets and Default Targets

A 'target' in Turboprop is an object that defines the object to be targeted, and the functions that define how 'getting' and 'setting' of properties using an accessor array will work:
```js
const target = {
  object: objectToTarget,
  methods: {
    // logic to 'get' and return properties from targetObject
    getter: (propNamesAr, targetObject) => returnVal,
    // logic to 'set' properties on targetObject (any return value is discarded)
    setter: (propNamesArr, valuesToSet, targetObject) => {}
  }
}
```

The default targets are `[ TARGET_STRING, TARGET_ARRAY, TARGET_OBJECT ]` - designed to provide common, hopefully useful functionality. The constants defining each of the defaults are also exported by the library should you wish to use them yourself:

```js
// String target
// Will 'get' a concatenation of chars specified by the indexes defined in the accessor array
const TARGET_STRING = {
  object: String.prototype,
  methods: {
    getter: (indexes, str) => indexes.reduce((newStr, index) => newStr + str[index], ''),
    setter: false
  }
}

// Array target
// Will 'get' an array of values specified by the indexes defined in the accessor array
// Will 'set' the values into the array slots specified by the indexes defined in the accessor array
const TARGET_ARRAY = {
  object: Array.prototype,
  methods: {
    getter: (indexes, arr) => indexes.reduce((newArr, index) => [...newArr, arr[index]], []),
    setter: (indexes, values, arr) => indexes.forEach((index, i) => arr[index] = values[i])
  }
}

// Object target
// Will 'get' an array of values specified by the property names defined in the accessor array
// Will 'set' the object properties specified by the property names defined in the accessor array
const TARGET_OBJECT = {
  object: Object.prototype,
  methods: {
    getter: (keys, obj) => keys.reduce((newArr, key) => [...newArr, obj[key]], []),
    setter: (keys, values, obj) => keys.forEach((key, i) => obj[key] = values[i])
  }
}
```

