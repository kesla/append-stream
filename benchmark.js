var AppendStream = require('./append-stream')
  , WriteStream = require('fs').WriteStream

  , directory = __dirname + '/testdir'

  , max = 100000

  , buffer = new Buffer('Hello World, beep boop. Ey yo! OMG OMG!')

  , setupParallelBenchmark = function (name, stream, callback) {
      var start = Date.now()
        , done = function () {
            console.log('%s: %sms', name, Date.now() - start)
            stream.end(callback)
          }
        , finished = 0
        , index = 0

      for(; index < max; ++index) {
        stream.write(buffer, function (err) {
          if (err)
            throw err

          if (++finished === max)
            done()
        })
      }

    }
  , setupSeriesBenchmark = function (name, stream, callback) {
      var start = Date.now()

        , done = function () {
            console.log('%s: %sms', name, Date.now() - start)
            stream.end(callback)
          }

        , write = function (index) {
            if (index === max)
              return done()

            stream.write(buffer, function (err) {
              if (err)
                throw err

              write(index + 1)
            })
          }
      write(0)
    }

  , parallelAppendStream = function (callback) {
      require('./append-stream')(directory + '/parallel-append-bench.txt', function (err, stream) {
        setupParallelBenchmark('AppendStream', stream, callback)
      })
    }

  , parallelWriteStream = function (callback) {
      var stream = new WriteStream(directory + '/parallel-writable-bench.txt')

      stream.once('open', function () {
        setupParallelBenchmark('WriteStream', stream, callback)
      })
    }
  , seriesAppendStream = function (callback) {
      require('./append-stream')(directory + '/series-append-bench.txt', function (err, stream) {
        setupSeriesBenchmark('AppendStream', stream, callback)
      })
    }

  , seriesWriteStream = function (callback) {
      var stream = new WriteStream(directory + '/serie-writable-bench.txt')

      stream.once('open', function () {
        setupSeriesBenchmark('WriteStream', stream, callback)
      })
    }

require('rimraf')(directory, function () {
  require('mkdirp')(directory, function () {
    console.log('writing %s small Buffers in parallel', max)
    parallelAppendStream(function () {
      parallelWriteStream(function () {
        console.log('writing %s small Buffers in series', max)
        seriesAppendStream(function () {
          seriesWriteStream()
        })
      })
    })
  })
})
