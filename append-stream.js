var fs = require('fs')

  , AppendStream = function (path, options, callback) {
      if (!(this instanceof AppendStream))
        return new AppendStream(path, options, callback)

      this.state = 'opening'
      this.fd = null
      this.buffer = []
      this.callbacks = []
      this.closeCallback = null

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

AppendStream.prototype._open = function (path, flags, mode, callback) {
  var self = this

  fs.open(path, flags, mode, function (err, fd) {
    if (err)
      throw err

    self.fd = fd
    self.state = 'idle'
    self._process()
    if (callback)
      callback(null, self)
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
      // check state here in case stream is closing

      if (self.state === 'writing')
        self.state = 'idle'
      self._process()
    })
  } else if (this.state === 'closing') {
      self._flush(function () {
        self._close(self.closeCallback)
      })
  }
}

AppendStream.prototype.write = function (buffer, callback) {
  if (!Buffer.isBuffer(buffer))
    buffer = new Buffer(buffer)

  this.buffer.push(buffer)
  if (typeof(callback) === 'function')
    this.callbacks.push(callback)

  this._process()
}

AppendStream.prototype._close = function (callback) {
  var self = this

  this.state = 'closing'
  fs.close(this.fd, function (err) {
    if (err)
      return callback(err)

    self.fd = null
    self.callbacks = null
    self.buffer = null
    self.state = 'closed'
    callback()
  })
}

AppendStream.prototype.close = function (callback) {
  callback = callback || function () {}

  if (this.state === 'opening') {
    callback(new Error('Must open stream to close it'))
  } else if (this.state === 'closing' || this.state === 'closed') {
    callback(new Error('Stream can only be closed once'))
  } else if (this.state === 'idle'){
    this.state = 'closing'
    this._close(callback)
  } else if (this.state === 'writing') {
    this.state = 'closing'
    this.closeCallback = callback
  }
}

module.exports = AppendStream