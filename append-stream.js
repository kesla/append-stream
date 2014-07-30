var fs = require('fs')
  , setImmediate = global.setImmediate || process.nextTick

  , AppendStream = function (path, options, callback) {
      if (!(this instanceof AppendStream))
        return new AppendStream(path, options, callback)

      this.state = 'opening'
      this.fd = null
      this.buffer = []
      this.callbacks = []
      this.endCallbacks = []

      if (typeof(options) === 'function') {
        callback = options
        options = {}
      }

      options = options || {}
      this._open(
          path
        , options.flags || 'w'
        , options.mode || 0666
        , callback
      )
    }
  , noop = function () {}

AppendStream.prototype._open = function (path, flags, mode, callback) {
  var self = this

  callback = callback || noop

  fs.open(path, flags, mode, function (err, fd) {

    if (err) {
      callback(err)
    } else {
      self.fd = fd

      // check so that we're behaving well even if we're closing an open
      // stream directly
      if (self.state === 'opening')
        self.state = 'idle'

      self._process()
      callback(null, self)
    }
  })
}

AppendStream.prototype._flush = function (callback) {
  var callbacks = this.callbacks
    , buffer = Buffer.concat(this.buffer)
    , self = this

  this.callbacks = []
  this.buffer = []

  fs.write(this.fd, buffer, 0, buffer.length, null, function (err) {
    callbacks.forEach(function (callback) {
      callback(err)
    })
    callback()
  })
}

AppendStream.prototype._process = function () {
  var self = this

  if (this.state === 'idle' && this.buffer.length > 0) {
    this.state = 'writing'
  
    this._flush(function () {
      // check state here in case stream is ending
      if (self.state === 'writing')
        self.state = 'idle'

      self._process()
    })
  } else if (this.state === 'ending') {
      self._flush(function () {
        self._end()
      })
  }
}

AppendStream.prototype.write = function (buffer, callback) {
  var self = this

  callback = callback || noop

  if (this.state === 'ending' || this.state === 'ended')
    return callback(new Error('write after end'))

  if (!Buffer.isBuffer(buffer))
    buffer = new Buffer(buffer)

  if (this.buffer.length === 0 && this.state === 'idle') {
    this.state = 'writing'

    fs.write(this.fd, buffer, 0, buffer.length, null, function (err) {
      if (self.state === 'writing')
        self.state = 'idle'

      self._process()
      callback()
    })
  } else {
    this.buffer.push(buffer)
    if (callback !== noop)
      this.callbacks.push(callback)

    this._process()
  }
}

AppendStream.prototype._end = function () {
  var self = this
    , done = function (err) {
        var callbacks = self.endCallbacks

        // if something goes wrong we're going assume that the fd
        // is closed
        self.endCallbacks = null
        self.fd = null
        self.callbacks = null
        self.endCallbacks = null
        self.buffer = null
        self.state = 'ended'

        callbacks.forEach(function (callback) {
          callback(err)
        })
      }

  this.state = 'ending'

  fs.fsync(this.fd, function (err) {
    if (err) {
      return done(err)
    }

    fs.close(self.fd, done)
  })
}

AppendStream.prototype.end = function (callback) {
  var oldState = this.state

  if (oldState === 'ended') {
    setImmediate(callback)
  } else {
    this.state = 'ending'
    if (callback)
      this.endCallbacks.push(callback)
    if (oldState === 'idle') {
      this._end()
    }
  }
}

module.exports = AppendStream