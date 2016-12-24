'use strict'

if (typeof RError !== 'undefined') {
  throw new Error('RError is already defined!')
}

/**
 * @namespace rerror
 *
 * @description
 * Isomorphic rich error.
 */
(function () {
  /**
   * Creates a rich error object
   * @param {(string|{name: string, message: string, cause: error})} options
   * Required, must be either the error name or an object containing the following properties:<br>
   * - {String} name<br>
   * - {String} [message]<br>
   * - {Error} [cause]
   * @constructor rerror.RError
   * @extends Error
   * @throws {RError} Throws a rich error with name INVALID_ARGS, if invalid arguments are provided
   *
   * @example
   * .catch(err => {
   *   throw new RError({
   *      name: 'BAR',
   *      message: 'I messed up',
   *      cause: err
   *   })
   * })
   */
  function RError (options) {
    // check args
    if (typeof options === 'string') {
      // set properties
      this.name = options
    } else {
      if (typeof options !== 'object') {
        throw new RError({
          name: 'INVALID_ARGS',
          message: 'expected required options parameter of type object'
        })
      }
      if (typeof options.name !== 'string') {
        throw new RError({
          name: 'INVALID_ARGS',
          message: 'expected required option name of type string'
        })
      }
      if (!options.name.trim().length) {
        throw new RError({
          name: 'INVALID_ARGS',
          message: 'expected required option name to consist of something other than whitespace'
        })
      }
      if (typeof options.message !== 'undefined' && typeof options.message !== 'string') {
        throw new RError({
          name: 'INVALID_ARGS',
          message: 'expected optional option message to be either undefined or of type string'
        })
      }
      if (typeof options.message === 'string' && !options.message.trim().length) {
        throw new RError({
          name: 'INVALID_ARGS',
          message: 'expected optional option message to consist of something other than whitespace'
        })
      }
      if (!(typeof options.cause === 'undefined' || options.cause instanceof Error)) {
        throw new RError({
          name: 'INVALID_ARGS',
          message: 'expected optional option cause to be either undefined of an instance of Error'
        })
      }
      // set properties
      this.name = options.name
      this.message = options.message
      this.cause = options.cause
    }

    // capture stack (this property is supposed to be treated as private)
    this._err = new Error()

    // create an iterable chain
    this.chain = this.cause ? [this].concat(this.cause.chain) : [this]
  }

  RError.prototype = Object.create(Error.prototype, {
    constructor: {
      value: RError,
      writable: true,
      configurable: true
    }
  })

  /**
   * @typedef rerror.RError#stack
   * @description Getter returning the stack of the top most error in the chain
   * @type {string}
   */
  Object.defineProperty(RError.prototype, 'stack', {
    get: function stack () {
      return 'Error\n' + this._err.stack.split('\n').slice(2).join('\n')
    }
  })

  /**
   * @typedef rerror.RError#why
   * @description Getter returning a human readable cause chain, e.g. FOO: I failed <- BAR: I messed up
   * @type {string}
   */
  Object.defineProperty(RError.prototype, 'why', {
    get: function why () {
      function _msg (message) {
        return message ? ': ' + message : ''
      }
      var _why = this.name + _msg(this.message)
      for (var i = 1; i < this.chain.length; i++) {
        var e = this.chain[i]
        _why += ' <- ' + e.name + _msg(e.message)
      }
      return _why
    }
  })

  /**
   * @typedef rerror.RError#stacks
   * @description Getter returning a stack of stacks using the cause chain
   * @type {string}
   */
  Object.defineProperty(RError.prototype, 'stacks', {
    get: function stacks () {
      var _stacks = this.stack
      for (var i = 1; i < this.chain.length; i++) {
        var e = this.chain[i]
        _stacks += '\n<- ' + e.stack
      }
      return _stacks
    }
  })

  /**
   * Checks if a certain cause is in the cause chain of the error.
   * @public
   * @function rerror.RError#hasCause
   * @param {string} name  The cause name to be searched for in the cause chain
   * @returns {boolean}
   */
  RError.prototype.hasCause = function hasCause (name) {
    return this.chain.some(function (e) {
      return e.name === name
    })
  }

  /**
   * The value returned by the toJSON method will be used for serialization when using JSON.stringify.
   * @public
   * @function rerror.RError#toJSON
   * @returns {{ name: string, message: string, why: string, stacks: string }}
   */
  RError.prototype.toJSON = function toJSON () {
    return {
      name: this.name,
      message: this.message,
      why: this.why,
      stacks: this.stacks
    }
  }

  if (typeof window === 'undefined' && typeof global === 'object') {
    global.RError = RError
  } else {
    window.RError = RError
  }
})()
