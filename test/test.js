'use strict'
/* global RError, describe, it, afterEach, beforeEach */

var assert = require('assert')

describe('initialization in Node.js global scope', function () {
  afterEach(function () {
    delete global.RError
    delete require.cache[require.resolve('../rerror')]
  })

  it('should initialize RError in the global scope', function () {
    require('../rerror')
    assert.equal(typeof RError, 'function')
  })

  it('should even work with multiple initializations', function () {
    require('../rerror')
    require('../rerror')
    require('../rerror')
    assert.equal(typeof RError, 'function')
  })

  it('should throw if RError is already defined in the global scope', function () {
    global.RError = 'foo'
    assert.throws(function () { require('../rerror') }, Error)
    try {
      require('../rerror')
    } catch (e) {
      assert.equal(e.message, 'RError is already defined!')
    }
  })
})

describe('initialization in pseudo browser global scope', function () {
  beforeEach(function () {
    global.window = global
  })
  afterEach(function () {
    delete global.RError
    delete global.window
    delete require.cache[require.resolve('../rerror')]
  })

  it('should initialize RError in the global scope', function () {
    require('../rerror')
    assert.equal(typeof global.window.RError, 'function')
  })

  it('should even work with multiple initializations', function () {
    require('../rerror')
    require('../rerror')
    require('../rerror')
    assert.equal(typeof global.window.RError, 'function')
  })

  it('should throw if RError is already defined in the global scope', function () {
    global.window.RError = 'foo'
    assert.throws(function () { require('../rerror') }, Error)
    try {
      require('../rerror')
    } catch (e) {
      assert.equal(e.message, 'RError is already defined!')
    }
  })
})

describe('constructor parameter checks', function () {
  beforeEach(function () {
    require('../rerror')
  })

  it('should throw if required options parameter of type object is missing', function () {
    function init () { RError() }
    assert.throws(init, Error)
    try {
      init()
    } catch (e) {
      assert.equal(e.message, 'expected required options parameter of type object')
    }
  })

  it('should throw if required option name of type string is missing', function () {
    function init () { RError({name: 123}) }
    assert.throws(init, Error)
    try {
      init()
    } catch (e) {
      assert.equal(e.message, 'expected required option name of type string')
    }
  })

  it('should throw if required option name of type string is an empty string', function () {
    function init () { RError({name: ''}) }
    assert.throws(init, Error)
    try {
      init()
    } catch (e) {
      assert.equal(e.message, 'expected required option name to consist of something other than whitespace')
    }
  })

  it('should throw if required option name of type string consists only of whitespace', function () {
    function init () { RError({name: ' \n '}) }
    assert.throws(init, Error)
    try {
      init()
    } catch (e) {
      assert.equal(e.message, 'expected required option name to consist of something other than whitespace')
    }
  })

  it('should throw if optional option message of type string is defined but not of type string', function () {
    function init () { RError({name: 'FOO', message: null}) }
    assert.throws(init, Error)
    try {
      init()
    } catch (e) {
      assert.equal(e.message, 'expected optional option message to be either undefined or of type string')
    }
  })

  it('should throw if optional option message of type string consists only of whitespace', function () {
    function init () { RError({name: 'FOO', message: ' \n '}) }
    assert.throws(init, Error)
    try {
      init()
    } catch (e) {
      assert.equal(e.message, 'expected optional option message to consist of something other than whitespace')
    }
  })

  it('should throw if optional option cause is defined but not an instance of Error', function () {
    function init () { RError({name: 'FOO', cause: null}) }
    assert.throws(init, Error)
    try {
      init()
    } catch (e) {
      assert.equal(e.message, 'expected optional option cause to be either undefined of an instance of Error')
    }
  })

  it('should not throw if optional options message and cause are undefined', function () {
    var e = new RError({name: 'FOO'})
    assert.ok(e instanceof RError, 'expected not to throw if optional options message and cause are undefined')
  })

  it('should not throw if options is of type string but treat it as the option name', function () {
    var e = new RError('FOO')
    assert.ok(e instanceof RError, 'expected not to throw if optional options message and cause are undefined')
    assert.equal(e.name, 'FOO')
    assert.equal(e.message, '')
    assert.equal(e.toString(), 'FOO')
  })
})

describe('usage', function () {
  it('should work', function () {
    function fail () {
      throw new Error()
    }

    function failFurther () {
      try {
        fail()
      } catch (err) {
        throw new RError({
          name: 'BAR',
          message: 'Something else went wrong',
          cause: err
        })
      }
    }

    function failEvenFurther () {
      try {
        failFurther()
      } catch (err) {
        throw new RError({
          name: 'FOO',
          message: 'Something went wrong',
          cause: err
        })
      }
    }

    try {
      failEvenFurther()
    } catch (e) {
      var firstFailSpot = 'test/test.js:160:13'
      var secondFailSpot = 'test/test.js:167:15'
      var thirdFailSpot = 'test/test.js:179:15'
      assert.equal(e.why, 'FOO: Something went wrong <- BAR: Something else went wrong <- Error')
      assert.ok(e.stack.split('\n')[1].indexOf(thirdFailSpot) !== -1, 'expected stack to point to the right spot')
      assert.ok(e.cause.stack.split('\n')[1].indexOf(secondFailSpot) !== -1, 'expected stack to point to the right spot')
      assert.ok(e.cause.cause.stack.split('\n')[1].indexOf(firstFailSpot) !== -1, 'expected cause stack to point to the right spot')
      assert.ok(Array.isArray(e.chain), 'expected cause chain to be an array')
      assert.equal(e.chain.length, 3)
      assert.equal(e.chain[0], e)
      assert.equal(e.chain[1], e.cause)
      assert.ok(e.stacks.indexOf(firstFailSpot) !== -1, 'expected stack to include first fail spot')
      assert.ok(e.stacks.indexOf(secondFailSpot) !== -1, 'expected stack to include second fail spot')
      var serialized = JSON.stringify(e)
      var parsed = JSON.parse(serialized)
      assert.equal(e.name, parsed.name)
      assert.equal(e.message, parsed.message)
      assert.equal(e.why, parsed.why)
      assert.equal(e.stacks, parsed.stacks)
      assert.ok(e.hasCause('FOO') === true)
      assert.ok(e.hasCause('BAR') === true)
      assert.ok(e.hasCause('Error') === true)
      assert.ok(e.hasCause('QUZ') === false)
      assert.equal(e.toString(), 'FOO: Something went wrong')
    }
  })
})
