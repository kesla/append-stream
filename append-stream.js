var fs = require('fs')

  , AppendStream = function (path, options) {
      if (!(this instanceof AppendStream))
        return new AppendStream(path, options)

      this.waiting = true
      this.fd = null
      this.buffer = []
      this.callbacks = []

      options = options || {}
      this._open(
          path
        , options.flags || 'w'
        , options.mode || 0666
      )
    }

AppendStream.prototype._open = function (path, flags, mode) {
  var self = this

  fs.open(path, flags, mode, function (err, fd) {
    if (err)
      throw err

    self.fd = fd
    self.waiting = false
    self._process()
  })
}

AppendStream.prototype._process = function () {
  if (this.waiting || this.buffer.length === 0)
    return

  var callbacks = this.callbacks
    , buffer = Buffer.concat(this.buffer)
    , self = this

  this.waiting = true
  this.callbacks = []
  this.buffer = []

  fs.write(this.fd, buffer, 0, buffer.length, null, function (err) {
    callbacks.forEach(function (callback) {
      callback(err)
    })
    self.waiting = false
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