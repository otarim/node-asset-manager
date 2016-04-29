var asset = require('../'),
	path = require('path'),
	assert = require('assert')

describe('production mode', function() {
	it('should return true', function() {
		asset.config({
			rev: path.resolve(__dirname, './rev.json'),
			debug: false,
			dist: 'dest',
			hashLength: 6,
			publicPath: path.resolve(__dirname, 'static/')
		})
		assert.equal(asset.css('all').length, 1)
	})
})

describe('debug mode', function() {
	it('should return true', function() {
		asset.config({
			rev: path.resolve(__dirname, './rev.json'),
			debug: true,
			publicPath: path.resolve(__dirname, 'static/')
		})
		assert.equal(asset.css('all').length, 2)
	})
})