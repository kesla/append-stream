var directory = __dirname + '/testdir/'
  , filename = directory + 'beep-boop'
  , AppendStream = require('./append-stream')

  , stream

require('rimraf').sync(directory)
require('mkdirp').sync(directory)

stream = new AppendStream(filename)

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
        // lazy: true means that the file won't be opened (created) unless there's a write
        require('./append-stream')(filename + '3', { lazy: true }, function (err, stream) {
          stream.end(function () {
            require('fs').exists(filename + '3', function (exists) {
              console.log('Does this file exists (it should not)?', exists)
            })
          })
        })
      })
    })
  })
})
