# npm-conf [![Build Status](https://travis-ci.org/kevva/npm-conf.svg?branch=master)](https://travis-ci.org/kevva/npm-conf)

> Get the npm config


## Install

```
$ npm install npm-conf
```


## Usage

```js
const npmConf = require('npm-conf');

const conf = npmConf();

conf.get('prefix')
//=> //=> /Users/unicorn/.npm-packages

conf.get('registry')
//=> https://registry.npmjs.org/
```


## API

### npmConf()

Returns the `npm` config.

### npmConf.defaults

Returns the default `npm` config.


## License

MIT © [Kevin Mårtensson](http:s//github.com/kevva)
