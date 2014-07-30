var fs = require('fs')
  , setImmediate = global.setImmediate || process.nextTick

  , AppendStream = function (path, options, callback) {
      if (!(this instanceof AppendStream))
        return new AppendStream(path, options, callback)

      this.status = 'new'
      this.fd = null
      this.writeBuffer = []
      this.writeCallbacks = []
      this.endCallbacks = []

      if (typeof(options) === 'function') {
        callback = options
        options = {}
      }

      options = options || {}
      callback = callback || noop

      this.options = {
          flags: options.flags || 'w'
        , mode: options.mode || 0666
        , lazy: options.lazy === true
        , path: path
      }

      var self = this

      if (!this.options.lazy)
        this._open(callback)
      else
        setImmediate(function () {
          callback(null, self)
        })
    }
  , noop = function () {}

AppendStream.prototype._open = function (callback) {
  var self = this

  this.status = 'opening'

  fs.open(
      this.options.path
    , this.options.flags
    , this.options.mode
    , function (err, fd) {

        if (err) {
          callback(err)
        } else {
          self.fd = fd

          // check so that we're behaving well even if we're closing an open
          // stream directly
          if (self.status === 'opening')
            self.status = 'idle'

          self._process()
          callback(null, self)
        }
      }
  )
}

AppendStream.prototype._flush = function (callback) {
  var writeCallbacks = this.writeCallbacks
    , buffer = Buffer.concat(this.writeBuffer)
    , self = this

  this.writeCallbacks = []
  this.writeBuffer = []

  fs.write(this.fd, buffer, 0, buffer.length, null, function (err) {
    writeCallbacks.forEach(function (writeCallback) {
      writeCallback(err)
    })
    callback()
  })
}

AppendStream.prototype._process = function () {
  var self = this

  if (this.status === 'idle' && this.writeBuffer.length > 0) {
    this.status = 'writing'

    this._flush(function () {
      // check status here in case stream is ending
      if (self.status === 'writing')
        self.status = 'idle'

      self._process()
    })
  } else if (this.status === 'ending') {
      self._flush(function () {
        self._end()
      })
  } else if (this.status === 'new') {
    self._open(function () {
      self._process()
    })
  }
}

AppendStream.prototype.write = function (buffer, callback) {
  var self = this

  callback = callback || noop

  if (this.status === 'ending' || this.status === 'ended')
    return callback(new Error('write after end'))

  if (!Buffer.isBuffer(buffer))
    buffer = new Buffer(buffer)

  if (this.writeBuffer.length === 0 && this.status === 'idle') {
    this.status = 'writing'

    fs.write(this.fd, buffer, 0, buffer.length, null, function (err) {
      if (self.status === 'writing')
        self.status = 'idle'

      self._process()
      callback()
    })
  } else {
    this.writeBuffer.push(buffer)
    if (callback !== noop)
      this.writeCallbacks.push(callback)

    this._process()
  }
}

AppendStream.prototype._end = function () {
  var self = this
    , done = function (err) {
        var endCallbacks = self.endCallbacks

        // if something goes wrong we're going assume that the fd
        // is closed
        self.endCallbacks = null
        self.fd = null
        self.writeBuffer = null
        self.writeCallbacks = null
        self.endCallbacks = null
        self.status = 'ended'

        endCallbacks.forEach(function (endCallback) {
          endCallback(err)
        })
      }

  this.status = 'ending'

  if (this.fd === null)
    return setImmediate(done)

  fs.fsync(this.fd, function (err) {
    if (err) {
      return done(err)
    }

    fs.close(self.fd, done)
  })
}

AppendStream.prototype.end = function (callback) {
  var oldStatus = this.status

  callback = callback || noop

  if (oldStatus === 'ended') {
    setImmediate(callback)
  } else {
    this.status = 'ending'
    this.endCallbacks.push(callback)
    if (oldStatus === 'idle' || oldStatus === 'new' && this.options.lazy) {
      this._end()
    }
  }
}

module.exports = AppendStream