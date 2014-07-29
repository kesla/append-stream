var fs = require('fs')

  , AppendStream = function (path, options, callback) {
      if (!(this instanceof AppendStream))
        return new AppendStream(path, options, callback)

      this.state = 'opening'
      this.fd = null
      this.buffer = []
      this.callbacks = []

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

AppendStream.prototype._process = function () {
  if (this.state !== 'idle' || this.buffer.length === 0)
    return

  var callbacks = this.callbacks
    , buffer = Buffer.concat(this.buffer)
    , self = this

  this.state = 'writing'
  this.callbacks = []
  this.buffer = []

  fs.write(this.fd, buffer, 0, buffer.length, null, function (err) {
    callbacks.forEach(function (callback) {
      callback(err)
    })
    self.state = 'idle'
    self._process()
  })
}

AppendStream.prototype.write = function (buffer, callback) {
  if (!Buffer.isBuffer(buffer))
    buffer = new Buffer(buffer)

  this.buffer.push(buffer)
  if (typeof(callback) === 'function')
    this.callbacks.push(callback)

  this._process()
}

module.exports = AppendStream