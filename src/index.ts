type RErrorOptions =
  | string
  | {
      name: string
      message?: string
      cause?: RError | Error
    }

/** Class representing a rich error. */
class RError {
  /** @property {string} name – The name property represents a name for the type of error. */
  public name: string
  /** @property {string} message – The message property is a human-readable description of the error. */
  public message: string
  /** @property {RError | Error} [cause] – The cause error. */
  public cause?: RError | Error
  /** @property {(RError | Error)[]} [chain] – The cause chain of the error. */
  public chain: (RError | Error)[]

  private _err: Error

  /**
   * Creates a rich error object
   * @param {(string|{name: string, message: string, cause: error})} options
   * Required, must be either the error name or an object containing the following properties:
   * - {String} name
   * - {String} [message]
   * - {Error} [cause]
   * @constructor RError
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
  constructor(options: RErrorOptions) {
    // check args
    if (typeof options === 'string') {
      // set properties
      this.name = options
      this.message = ''
    } else {
      if (typeof options !== 'object') {
        throw new RError({
          name: 'INVALID_ARGS',
          message: 'expected required options parameter of type object',
        })
      }
      if (typeof options.name !== 'string') {
        throw new RError({
          name: 'INVALID_ARGS',
          message: 'expected required option name of type string',
        })
      }
      if (
        typeof options.message !== 'undefined' &&
        typeof options.message !== 'string'
      ) {
        throw new RError({
          name: 'INVALID_ARGS',
          message:
            'expected optional option message to be either undefined or of type string',
        })
      }
      if (
        !(
          typeof options.cause === 'undefined' ||
          options.cause instanceof Error ||
          options.cause instanceof RError
        )
      ) {
        throw new RError({
          name: 'INVALID_ARGS',
          message:
            'expected optional option cause to be either undefined or an instance of Error',
        })
      }
      // set properties
      this.name = options.name
      this.message = options.message || ''
      this.cause = options.cause
    }

    // capture stack (this property is supposed to be treated as private)
    this._err = new Error()

    // create an iterable chain
    if (this.cause instanceof RError) {
      const chain = this.cause.chain.slice()
      chain.unshift(this)
      this.chain = chain
    } else if (this.cause instanceof Error) {
      this.chain = [this, this.cause]
    } else {
      this.chain = [this]
    }
  }

  /**
   * @typedef RError#stack
   * @description Getter returning the stack of the top most error in the chain
   * @type {string}
   */
  get stack() {
    /* istanbul ignore if */
    if (!this._err.stack) return ''
    return 'Error\n' + this._err.stack.split('\n').slice(2).join('\n')
  }

  /**
   * @typedef RError#why
   * @description Getter returning a human readable cause chain, e.g. FOO: I failed <- BAR: I messed up
   * @type {string}
   */
  get why() {
    function _msg(message: string) {
      return message ? ': ' + message : ''
    }
    let _why = this.name + _msg(this.message)
    for (let i = 1; i < this.chain.length; i++) {
      const e = this.chain[i]
      _why += ' <- ' + e.name + _msg(e.message)
    }
    return _why
  }

  /**
   * @typedef RError#stacks
   * @description Getter returning a stack of stacks using the cause chain
   * @type {string}
   */
  get stacks() {
    let _stacks = this.stack
    for (let i = 1; i < this.chain.length; i++) {
      const e = this.chain[i]
      _stacks += '\n<- ' + e.stack
    }
    return _stacks
  }

  /**
   * Checks if a certain cause is in the cause chain of the error.
   * @public
   * @function RError#hasCause
   * @param {string} name The cause name to be searched for in the cause chain
   * @returns {boolean}
   */
  hasCause(name: string) {
    return this.chain.some(function (e) {
      return e.name === name
    })
  }

  /**
   * The value returned by the toJSON method will be used for serialization when using JSON.stringify.
   * @public
   * @function RError#toJSON
   * @returns {{ name: string, message: string, why: string, stacks: string }}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      why: this.why,
      stacks: this.stacks,
    }
  }

  /**
   * Returns a string representing the specified RError object.
   * @public
   * @function RError#toString
   * @returns {string}
   */
  toString() {
    return `${this.name}${this.message ? ': ' + this.message : ''}`
  }
}

export default RError
