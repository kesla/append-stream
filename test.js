var fs = require('fs')

  , test = require('tape')

  , directory = __dirname + '/testdir'

  , AppendStream = require('./append-stream')

test('setup', function (t) {
  require('rimraf')(directory, function (err) {
    if (err)
      return t.end(err)

    require('mkdirp')(directory, t.end.bind(t));
  })
})

})

test('append some strings', function (t) {
  var filename = directory + '/test.txt'
    , stream = new AppendStream(filename)

  stream.write('beep ')
  stream.write('boop ')
  stream.write('hello ')
  stream.write('world ', function () {
    fs.readFile(filename, 'utf8', function (err, content) {
      t.equal(content, 'beep boop hello world ')
      t.end()
    })
  })
})

test('append some buffers', function (t) {
  var filename = directory + '/test2.txt'
    , stream = new AppendStream(filename)

  stream.write(new Buffer([ 1, 2, 3, 4, 5 ]))
  stream.write(new Buffer([ 6, 7, 8 ]))
  stream.write(new Buffer([ 9, 10 ]), function () {
    fs.readFile(filename, function (err, content) {
      t.deepEqual(content, new Buffer([ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]))
      t.end()
    })
  })
})

test('append lots of data', function (t) {
  var filename = directory + '/test2.txt'
    , stream = new AppendStream(filename)
    , finished = 0
    , max = 5000
    , expected = new Buffer(5000)
    , index = 0

  expected.fill(7)

  // write 4999 times
  while(index++ < max - 1)
    stream.write(new Buffer([ 7 ]))

  // and then a last 5000 time
  stream.write(new Buffer([ 7 ]), function () {
    fs.readFile(filename, function (err, content) {
      t.deepEqual(content, expected)
      t.end()
    })
  })
})
