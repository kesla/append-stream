# append-stream[![build status](https://secure.travis-ci.org/kesla/append-stream.svg)](http://travis-ci.org/kesla/append-stream)

__sales pitch__: Sometimes all you want to do is to write to a file. And you want it to be simple. And fast. Oh, and perhaps open the file lazily. Well, than `append-stream` is the right choice for you!


[![NPM](https://nodei.co/npm/append-stream.png?downloads&stars)](https://nodei.co/npm/append-stream/)

[![NPM](https://nodei.co/npm-dl/append-stream.png)](https://nodei.co/npm/append-stream/)

## Installation

```
npm install append-stream
```

## Features

### Comparsion to fs.createWriteStream()

`append-stream` behaves similar to `fs.createWriteStream()` - but it has fewer features. Currently `append-stream` does not support:

* .pipe()
* backpressure
* streams2-compability
* writing data at some point past the beginning of the file
* events

### Buffering

When a stream isn't avaible for write (e.g. when a write is active or the stream is getting opened), all subsequental writes will be buffered and then written to disk in a single write once the stream is available again. This explains the super fast times for writing concurrently, as shown in the benchmarks below.

### Error handling

In `append-stream` a write() or end() you can only handle errors in the callback. This means that the below example there's no way to handle any potential error.

```javascript

var stream = new AppendStream(filename)

stream.write('beep')
stream.write('boop')
stream.end()

```

### lazy: true

A feature that `append-stream` has is that you can configure it to lazily open (and thereby create) the file that's being appended to.

This means that the file will be opened the first time that you call `stream.write()`

## Example

### Input

```javascript
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
```

### Output

```
written to file:
beepboop
the stream is now opened and ready!
and now the stream has ended
Does this file exists (it should not)? false
```

## Benchmark

Running `node benchmark.js` on my Macbook Air (mid 2012) I get the following results:

```
writing 100000 small Buffers in parallel
AppendStream: 310ms
WriteStream: 6836ms
writing 100000 small Buffers in series
AppendStream: 1815ms
WriteStream: 2066ms
```

## Licence

Copyright (c) 2014 David Björklund

This software is released under the MIT license:

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
