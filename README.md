# (ノಠ益ಠ)ノﾐ ɹoɹɹǝɹ

[![Build Status](https://travis-ci.org/borisdiakur/rerror.svg?branch=master)](https://travis-ci.org/borisdiakur/rerror)
[![Coverage Status](https://coveralls.io/repos/borisdiakur/rerror/badge.svg?branch=master)](https://coveralls.io/r/borisdiakur/rerror?branch=master)
[![Dependency Status](https://gemnasium.com/borisdiakur/rerror.svg)](https://gemnasium.com/borisdiakur/rerror)
[![npm version](https://badge.fury.io/js/rerror.svg)](http://badge.fury.io/js/rerror)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

The utility module rerror provides the `RError` constructor, which you can use instead of `Error`. It allows throwing and handling “rich errors” in Node.js and the browser.
The main strength of a “rich error” is its ability to provide deeply nested however simply consumable information about the cause of failure without significant impact on performance.

__Try it in your browser__: https://runkit.com/borisdiakur/rerror

## Installation

Node.js:

```shell
$ npm install --save rerror
```

In the browser:

```html
<script type="text/javascript" src="rerror.js"></script>
```

![IE](https://badges.herokuapp.com/browsers?iexplore=-7,!8,9,10,11,edge)
![Firefox](https://badges.herokuapp.com/browsers?firefox=4.0)
![Google Chrome](https://badges.herokuapp.com/browsers?googlechrome=5)
![Safari](https://badges.herokuapp.com/browsers?safari=5.1)
![Opera](https://badges.herokuapp.com/browsers?opera=11.60)

![Android](https://badges.herokuapp.com/browsers?android=yes)
![iPhone](https://badges.herokuapp.com/browsers?iphone=yes)
![iPad](https://badges.herokuapp.com/browsers?ipad=yes)

## Usage

Once required or loaded in the browser, the `RError` constructor is available via the global scope, ([`global`](https://nodejs.org/api/globals.html#globals_global) in Node.js respectively [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) in the browser), just like `Error`.

```js
require('rerror')
throw new RError({name: 'FOO'})
```

An example:

```js
function fail() {
  throw new RError({
    name: 'BAR',
    message: 'I messed up.'
  })
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
    at failFurther (/Users/boris/Workspace/playground/es5/index.js:98:11)
    at Object.<anonymous> (/Users/boris/Workspace/playground/es5/index.js:107:3)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.runMain (module.js:590:10)
    at run (bootstrap_node.js:394:7)
<- Error
    at fail (/Users/boris/Workspace/playground/es5/index.js:88:9)
    at failFurther (/Users/boris/Workspace/playground/es5/index.js:96:5)
    at Object.<anonymous> (/Users/boris/Workspace/playground/es5/index.js:107:3)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.runMain (module.js:590:10)
```

## API

### rerror.RError ⇐ `Error`
**Kind**: static class
**Extends:** `Error`

#### new RError(options)
Creates a rich error object

**Throws**:

- `RError` Throws a rich error with name INVALID_ARGS, if invalid arguments are provided

| Param | Type | Description |
| --- | --- | --- |
| options / name | `object` or `string` | Required, if object, it must consists of the following properties:<br> - {String} name<br> - {String} [message]<br> - {Error} [cause] |

**Example with cause**  
```js
.catch(err => {
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

**Kind**: instance method of `[RError](#rerror.RError)`
**Access:** public

| Param | Type | Description |
| --- | --- | --- |
| name | `string` | The cause name to be searched for in the cause chain |

#### toJSON() ⇒ `Object`
The value returned by the toJSON method will be used for serialization when using JSON.stringify.

**Returns:** `{ name: string, message: string, why: string, stacks: string }`

### Properties

#### why : `string`
Getter returning a human readable cause chain, e.g. FOO: I failed <- BAR: I messed up

#### stacks : `string`
Getter returning a stack of stacks using the cause chain

___

Enjoy!
