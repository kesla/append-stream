# append-stream[![build status](https://secure.travis-ci.org/kesla/append-stream.png)](http://travis-ci.org/kesla/append-stream)

A quick and dirty really fast stream-like module to append data to a file

[![NPM](https://nodei.co/npm/append-stream.png?downloads&stars)](https://nodei.co/npm/append-stream/)

[![NPM](https://nodei.co/npm-dl/append-stream.png)](https://nodei.co/npm/append-stream/)

## Installation

```
npm install append-stream
```

## Features

`append-stream` behaves similar to `fs.createWriteStream()` - but it has fewer features. Currently `append-stream` does not support:

* .pipe()
* backpressure
* streams2-compability

In `append-stream` a write() or end() you can only handle errors in the callback. This means that the below example there's no way to handle any potential error.

```javascript

var stream = new AppendStream(filename)

stream.write('beep')
stream.write('boop')
stream.end()

```

## Example

### Input

```javascript
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
```

### Output

```
written to file:
beepboop
the stream is now opened and ready!
and now the stream has ended
```

## Benchmark

Running `node benchmark.js` on my Macbook Pro I see:

```
writing 5000 small Buffers in parallel
AppendStream: 7ms
WriteStream: 85ms
writing 5000 small Buffers in series
AppendStream: 66ms
WriteStream: 67ms
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
