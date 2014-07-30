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

test('factory init', function (t) {
  var filename = directory + '/init-test.txt'

  require('./append-stream')(filename, function (err, stream) {
    t.error(err)
    t.ok(stream instanceof AppendStream)
    t.ok(typeof(stream.fd) === 'number')
    t.equal(stream.status, 'idle')
    t.end()
  })
})

test('append some strings', function (t) {
  var filename = directory + '/some-strings.txt'
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
  var filename = directory + '/some-buffers.txt'
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
  var filename = directory + '/lots-of-data.txt'
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

test('end() idle stream', function (t) {
  var filename = directory + '/end-idle.txt'

  AppendStream(filename, function (err, stream) {
    stream.end(function (err) {
      t.notOk(err)
      t.equal(stream.writeBuffer, null)
      t.equal(stream.writeCallbacks, null)
      t.equal(stream.endCallbacks, null)
      t.equal(stream.fd, null)
      t.equal(stream.status, 'ended')
      t.end()
    })
  })
})

test('end() opening stream', function (t) {
  var filename = directory + '/end-opening.txt'
    , stream = new AppendStream(filename)

  stream.end(function (err) {
    t.notOk(err)
    t.equal(stream.writeBuffer, null)
    t.equal(stream.writeCallbacks, null)
    t.equal(stream.endCallbacks, null)
    t.equal(stream.fd, null)
    t.equal(stream.status, 'ended')
    t.end()
  })
})

test('end() active stream', function (t) {
  var filename = directory + '/end-active.txt'

  AppendStream(filename, function (err, stream) {
    stream.write('hello')
    stream.write(', ')
    stream.write('world')
    // stream.writeBuffer will have data at this point
    stream.end(function () {
      t.equal(stream.writeBuffer, null)
      t.equal(stream.writeCallbacks, null)
      t.equal(stream.endCallbacks, null)
      t.equal(stream.fd, null)
      t.equal(stream.status, 'ended')

      fs.readFile(filename, 'utf8', function (err, content) {
        t.equal(content, 'hello, world')
        t.end()
      })
    })
  })
})

test('end() active stream2', function (t) {
  var filename = directory + '/end-active2.txt'

  AppendStream(filename, function (err, stream) {
    stream.write('hello')
    // stream.writeBuffer will be empty when running end (it's being written)
    stream.end(function () {
      t.equal(stream.writeBuffer, null)
      t.equal(stream.writeCallbacks, null)
      t.equal(stream.endCallbacks, null)
      t.equal(stream.fd, null)
      t.equal(stream.status, 'ended')

      fs.readFile(filename, 'utf8', function (err, content) {
        t.equal(content, 'hello')
        t.end()
      })
    })
  })
})

test('double end()', function (t) {
  var filename = directory + '/end-double.txt'

  AppendStream(filename, function (err, stream) {
    stream.end()
    stream.end(function (err) {
      t.notOk(err)
      t.equal(stream.writeBuffer, null)
      t.equal(stream.writeCallbacks, null)
      t.equal(stream.endCallbacks, null)
      t.equal(stream.fd, null)
      t.equal(stream.status, 'ended')
      t.end()
    })
  })
})

test('end() on ended stream', function (t) {
  var filename = directory + '/end-already-ended.txt'

  AppendStream(filename, function (err, stream) {
    stream.end(function () {
      stream.end(function (err) {
        t.notOk(err)
        t.equal(stream.writeBuffer, null)
        t.equal(stream.writeCallbacks, null)
        t.equal(stream.endCallbacks, null)
        t.equal(stream.fd, null)
        t.equal(stream.status, 'ended')
        t.end()
      })
    })
  })
})

test('write() after end()', function (t) {
  var filename = directory + '/write-after-end.txt'

  AppendStream(filename, function (err, stream) {
    stream.end(function () {
      stream.write('hey ho', function (err) {
        t.equal(err.message, 'write after end')
        t.end()
      })
    })
  })
})

test('lazy: true, but no write() & then end()', function (t) {
  var filename = directory + '/lazy-no-write.txt'

  AppendStream(filename, { lazy: true }, function (err, stream) {
    stream.end(function () {
      t.equal(stream.writeBuffer, null)
      t.equal(stream.writeCallbacks, null)
      t.equal(stream.endCallbacks, null)
      t.equal(stream.fd, null)
      t.equal(stream.status, 'ended')
      fs.exists(filename, function (exists) {
        t.equal(exists, false)
        t.end()
      })
    })
  })
})

test('lazy: true, write & then end', function (t) {
  var filename = directory + '/lazy-write-end.txt'

  AppendStream(filename, { lazy: true }, function (err, stream) {
    stream.write('beep boop', function () {
      fs.readFile(filename, function (err, content) {
        t.equal(content.toString(), 'beep boop')
        stream.end(function () {
          t.equal(stream.writeBuffer, null)
          t.equal(stream.writeCallbacks, null)
          t.equal(stream.endCallbacks, null)
          t.equal(stream.fd, null)
          t.equal(stream.status, 'ended')
          t.end()
        })
      })
    })
  })
})

test('lazy: true, multiple writes', function (t) {
  var filename = directory + '/lazy-multiple-writes.txt'

  AppendStream(filename, { lazy: true }, function (err, stream) {
    stream.write('beep')
    stream.write(' ')
    stream.write('boop', function () {
      fs.readFile(filename, function (err, content) {
        t.equal(content.toString(), 'beep boop')
        stream.end(function () {
          t.equal(stream.writeBuffer, null)
          t.equal(stream.writeCallbacks, null)
          t.equal(stream.endCallbacks, null)
          t.equal(stream.fd, null)
          t.equal(stream.status, 'ended')
          t.end()
        })
      })
    })
  })
})
