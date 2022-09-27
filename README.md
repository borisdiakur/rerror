# (ノಠ益ಠ)ノﾐ ɹoɹɹǝɹ

> 🚨 `Error.prototype.cause` has been implemented in [ES2022](https://exploringjs.com/impatient-js/ch_exception-handling.html#error.cause). Consider using the native implementation.

[![Build Status](https://travis-ci.org/borisdiakur/rerror.svg?branch=master)](https://travis-ci.org/borisdiakur/rerror)
[![Coverage Status](https://coveralls.io/repos/borisdiakur/rerror/badge.svg?branch=master)](https://coveralls.io/r/borisdiakur/rerror?branch=master)
[![npm version](https://badge.fury.io/js/rerror.svg)](http://badge.fury.io/js/rerror)

Use `RError` instead of `Error` in Node.js and the browser.
It provides nested information about the cause of failure
without significant impact on performance.

## Installation

```shell
$ npm install --save rerror
```

```shell
$ yarn add rerror
```

## Usage

rerror is available in multiple module formats, so that you can import or require it or add it as a script to your html. Here are a few examples:

```js
import RError from 'rerror'
throw new RError('(×﹏×)')
```

```js
const RError = require('rerror')
throw new RError('ヽ(`⌒´メ)ノ')
```

```html
<script src="https://unpkg.com/rerror/dist/index.iife.js"></script>
<!-- RError is now available in the global scope -->
<script>throw new RError('ヾ( ￣O￣)ツ')</script>
```

Here is an example illustrating how you can use rerror to pass along the information about the cause of failure:

```js
function fail() {
  throw new RError({
    name: 'BAR',
    message: 'I messed up.'
  })
  // Note that you could throw an Error instance here as well,
  // or have something else throw for you, e.g. JSON.parse('(⇀‸↼‶)')
}

function failFurther() {
  try {
    fail()
  } catch (err) {
    throw new RError({
      name: 'FOO',
      message: 'Something went wrong.',
      cause: err
    })
  }
}

try {
  failFurther()
} catch (err) {
  console.error(err.why)
  console.error(err.stacks)
}
```

The output looks something like this:

```
FOO: Something went wrong. <- BAR: I messed up.
Error
    at failFurther (<current_working_dir>/index.js:98:11)
    at Object.<anonymous> (<current_working_dir>/index.js:107:3)
    ...
<- Error
    at fail (<current_working_dir>/index.js:88:9)
    at failFurther (<current_working_dir>/index.js:96:5)
    at Object.<anonymous> (<current_working_dir>/index.js:107:3)
    ...
```

## API

rerror includes a typescript declaration (.d.ts) file, so your editor will probably give you some good hints on how to use it.

### RError

#### new RError(options)
Instanciates a RError instance.

| Param | Type | Description |
| --- | --- | --- |
| options / name | `object` or `string` | Required; if object, it must consist of the following properties:<br> - `{String} name`<br> - `{String} [message]`<br> - `{RError`&#124;`Error} [cause]` |

**Example with cause**  
```js
Promise.reject(new Error('fail')).catch(err => {
  throw new RError({
     name: 'BAR',
     message: 'I messed up',
     cause: err
  })
})
```

**Example of usage as a drop-in replacement**  
```js
throw new RError('BAR')
```

### Methods

#### hasCause(name) ⇒ `boolean`
Checks if a certain cause is in the cause chain of the error.

| Param | Type | Description |
| --- | --- | --- |
| name | `string` | The cause name to be searched for in the cause chain |

#### toJSON() ⇒ `Object`
The value returned by the toJSON method will be used for serialization when using JSON.stringify.

**Returns:** `{ name: string, message: string, why: string, stacks: string }`

#### toString() ⇒ `String`
Returns a string representing the specified RError object.

### Properties

#### name: `string`
The name property represents a name for the type of error.

#### message: `string`
The message property is a human-readable description of the error.

#### [cause] : `RError | Error`
The cause error.

#### chain : `(RError | Error)[]`
The cause chain of the error.

#### stack : `string`
Getter returning the stack of the top most error in the chain.

#### stacks : `string`
Getter returning a stack of stacks using the cause chain.

#### why : `string`
Getter returning a human readable cause chain, e.g. FOO: I failed <- BAR: I messed up.

___

Enjoy!
