var AppendStream = require('./append-stream')
  , WriteStream = require('fs').WriteStream

  , directory = __dirname + '/testdir'

  , max = 5000

  , buffer = new Buffer('Hello World, beep boop. Ey yo! OMG OMG!')

  , setupBench = function (stream) {
      return function (callback) {
        var finished = 0
          , index = 0

        for(; index < max; ++index) {
          stream.write(buffer, function (err) {
            if (err)
              throw err

            if (++finished === max)
              callback()
          })
        }
      }

    }

  , appendStream = function (callback) {
      var stream  = new AppendStream(directory + '/append-bench.txt')
        , start = Date.now()

      setupBench(stream)(function () {
        console.log('AppendStream: ' + (Date.now() - start) + 'ms')
        if (callback)
          callback()
      })
    }

  , writeStream = function (callback) {
      var stream = new WriteStream(directory + '/writable-bench.txt')
        , start = Date.now()

      setupBench(stream)(function () {
        console.log('WriteStream: ' + (Date.now() - start) + 'ms')
        if (callback)
          callback()
      })
    }

appendStream(function () {
  writeStream()
})