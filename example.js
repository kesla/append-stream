var filename = __dirname + '/testdir/beep-boop'
  , AppendStream = require('./append-stream')

  , stream = new AppendStream(filename)

stream.write('beep')
stream.write('boop', function () {
  require('fs').readFile(filename, 'utf8', function (err, content) {
    console.log('written to file:')
    console.log(content)

    // you can also use append-stream as a factory
    require('./append-stream')(filename + '2', function (err, stream) {
      console.log('the stream is now opened and ready!')
      // nice - you can end a stream!
      stream.end(function () {
        console.log('and now the stream has ended')
      })
    })
  })
})