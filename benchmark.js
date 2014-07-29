var AppendStream = require('./append-stream')
  , WriteStream = require('fs').WriteStream

  , directory = __dirname + '/testdir'

  , max = 5000

  , buffer = new Buffer('Hello World, beep boop. Ey yo! OMG OMG!')

  , setupParallelBenchmark = function (stream) {
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
  , setupSeriesBenchmark = function (stream) {
      return function (callback) {
        var write = function (index) {
          if (index === max)
            return callback()

          stream.write(buffer, function (err) {
            if (err)
              throw err

            write(index + 1)
          })
        }
        write(0)        
      }
    }

  , parallelAppendStream = function (callback) {
      var stream  = new AppendStream(directory + '/parallel-append-bench.txt')
        , start = Date.now()

      setupParallelBenchmark(stream)(function () {
        console.log('AppendStream: ' + (Date.now() - start) + 'ms')
        if (callback)
          callback()
      })
    }

  , parallelWriteStream = function (callback) {
      var stream = new WriteStream(directory + '/parallel-writable-bench.txt')
        , start = Date.now()

      setupParallelBenchmark(stream)(function () {
        console.log('WriteStream: ' + (Date.now() - start) + 'ms')
        if (callback)
          callback()
      })
    }
  , seriesAppendStream = function (callback) {
      var stream  = new AppendStream(directory + '/series-append-bench.txt')
        , start = Date.now()

      setupSeriesBenchmark(stream)(function () {
        console.log('AppendStream: ' + (Date.now() - start) + 'ms')
        if (callback)
          callback()
      })
    }

  , seriesWriteStream = function (callback) {
      var stream = new WriteStream(directory + '/serie-writable-bench.txt')
        , start = Date.now()

      setupSeriesBenchmark(stream)(function () {
        console.log('WriteStream: ' + (Date.now() - start) + 'ms')
        if (callback)
          callback()
      })
    }

console.log('writing %s small Buffers in parallel', max)
parallelAppendStream(function () {
  parallelWriteStream(function () {
    console.log('writing %s small Buffers in series', max)
    seriesAppendStream(function () {
      seriesWriteStream()
    })
  })
})