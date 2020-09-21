import RError from '../src/index'
import assert from 'assert'

describe('constructor parameter checks', function () {
  it('should throw if required options parameter is missing', function () {
    function init() {
      // @ts-ignore
      new RError()
    }
    assert.throws(init, RError)
    try {
      init()
    } catch (e) {
      assert.equal(
        e.message,
        'expected required options parameter of type object'
      )
    }
  })

  it('should throw if required option name of type string is missing', function () {
    function init() {
      // @ts-ignore
      new RError({ name: 123 })
    }
    assert.throws(init, RError)
    try {
      init()
    } catch (e) {
      assert.equal(e.message, 'expected required option name of type string')
    }
  })

  it('should throw if optional option message of type string is defined but not of type string', function () {
    function init() {
      // @ts-ignore
      new RError({ name: 'FOO', message: null })
    }
    assert.throws(init, RError)
    try {
      init()
    } catch (e) {
      assert.equal(
        e.message,
        'expected optional option message to be either undefined or of type string'
      )
    }
  })

  it('should throw if optional option cause is defined but not an instance of Error or RError', function () {
    function init() {
      // @ts-ignore
      new RError({ name: 'FOO', cause: null })
    }
    assert.throws(init, RError)
    try {
      init()
    } catch (e) {
      assert.equal(
        e.message,
        'expected optional option cause to be either undefined or an instance of Error'
      )
    }
  })

  it('should not throw if optional options message and cause are undefined', function () {
    const e = new RError({ name: 'FOO' })
    assert.ok(
      e instanceof RError,
      'expected not to throw if optional options message and cause are undefined'
    )
  })

  it('should not throw if options is of type string but treat it as the option name', function () {
    const e = new RError('FOO')
    assert.ok(
      e instanceof RError,
      'expected not to throw if optional options message and cause are undefined'
    )
    assert.equal(e.name, 'FOO')
    assert.equal(e.message, '')
    assert.equal(e.toString(), 'FOO')
  })
})

describe('usage', function () {
  it('should work', function () {
    function fail() {
      throw new Error()
    }

    function failFurther() {
      try {
        fail()
      } catch (err) {
        throw new RError({
          name: 'BAR',
          message: 'Something else went wrong',
          cause: err,
        })
      }
    }

    function failEvenFurther() {
      try {
        failFurther()
      } catch (err) {
        throw new RError({
          name: 'FOO',
          message: 'Something went wrong',
          cause: err,
        })
      }
    }

    try {
      failEvenFurther()
    } catch (e) {
      const firstFailSpot = 'test/test.ts:89:13'
      const secondFailSpot = 'test/test.ts:96:15'
      const thirdFailSpot = 'test/test.ts:108:15'
      assert.equal(
        e.why,
        'FOO: Something went wrong <- BAR: Something else went wrong <- Error'
      )
      assert.ok(
        e.stack.split('\n')[1].indexOf(thirdFailSpot) !== -1,
        'expected stack to point to the right spot'
      )
      assert.ok(
        e.cause.stack.split('\n')[1].indexOf(secondFailSpot) !== -1,
        'expected stack to point to the right spot'
      )
      assert.ok(
        e.cause.cause.stack.split('\n')[1].indexOf(firstFailSpot) !== -1,
        'expected cause stack to point to the right spot'
      )
      assert.ok(Array.isArray(e.chain), 'expected cause chain to be an array')
      assert.equal(e.chain.length, 3)
      assert.equal(e.chain[0], e)
      assert.equal(e.chain[1], e.cause)
      assert.ok(
        e.stacks.indexOf(firstFailSpot) !== -1,
        'expected stack to include first fail spot'
      )
      assert.ok(
        e.stacks.indexOf(secondFailSpot) !== -1,
        'expected stack to include second fail spot'
      )
      const serialized = JSON.stringify(e)
      const parsed = JSON.parse(serialized)
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
