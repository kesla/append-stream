# append-stream[![build status](https://secure.travis-ci.org/kesla/append-stream.png)](http://travis-ci.org/kesla/append-stream)

A quick and dirty really fast stream-like module to append data to a file

[![NPM](https://nodei.co/npm/append-stream.png?downloads&stars)](https://nodei.co/npm/append-stream/)

[![NPM](https://nodei.co/npm-dl/append-stream.png)](https://nodei.co/npm/append-stream/)

## Installation

```
npm install append-stream
```

## Differences from fs.WriteStream

`append-stream` behaves similar to `fs.createWriteStream()` - but it has fewer features. Currently `append-stream` does not support:

* .pipe()
* backpressure
* streams2-compability

In `append-stream` a write() you can only handle errors in the callback. This means that the below example there's no way to handle any potential error.

```javascript

var stream = new AppendStream(filename)

stream.write('beep')
stream.write('boop')

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
  })
})
```

### Output

```
written to file:
beepboop
```

## Benchmark

Running `node benchmark.js` on my Macbook Pro I see:

```
AppendStream: 15ms
WriteStream: 74ms
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
