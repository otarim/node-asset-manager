var assets = require('../index.js'),
	fs = require('fs'),
	path = require('path')

assets.config({
	rev: JSON.parse(fs.readFileSync(path.resolve(__dirname, './rev.json'))),
	debug: true,
	dist: './dist'
})

console.log(assets.css('all'))