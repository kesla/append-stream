var filename = __dirname + '/testdir/beep-boop'
  , AppendStream = require('./append-stream')

  , stream = new AppendStream(filename)

stream.write('beep')
stream.write('boop', function () {
  require('fs').readFile(filename, 'utf8', function (err, content) {
    console.log('written to file:')
    console.log(content)
  })
})