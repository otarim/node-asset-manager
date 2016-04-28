var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var CleanCSS = require('clean-css')
var UglifyJS = require("uglify-js")

var asset = {
    js: {},
    css: {}
}

var ASSETCONFIG = {
    dist: '',
    debug: process.env.NODE_ENV === 'production' ? false : true,
    rev: null
}

var getRevFile = (function() {
    var _rev, tmp
    var process = function(name) {
        if (_rev[name]) {
            for (var i = 0, l = _rev[name].src.length; i < l; i++) {
                process(_rev[name]['src'][i])
            }
        } else if (tmp.indexOf(name) === -1) {
            tmp.push(name)
        }
    }
    return function(name, type) {
        tmp = []
        _rev = ASSETCONFIG.rev[type]
        process(name)
        return tmp
    }
})()


function getEntry(rev, type) {
    // 压缩，合并
    var content = rev.map(function(file) {
        // file = prefix + file
        return fs.readFileSync(file).toString()
    })
    if (type === 'js') {
        content = UglifyJS.minify(content, {
            fromString: true
        }).code
    }
    if (type === 'css') {
        content = content.join('')
        content = new CleanCSS().minify(content).styles
    }
    return content
}

function getHash(rev) {
    return md5(rev.map(function(file) {
        // file = prefix + file
        return md5(fs.readFileSync(file))
    }).join(''))
}

function md5(str) {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex')
}

function updateFilename(filename, hash, type) {
    return ASSETCONFIG.dist + '/' + filename + '.' + hash + '.' + type
}

function genFile(name, content) {
    if (!fs.existsSync(ASSETCONFIG.dist)) {
        fs.mkdirSync(ASSETCONFIG.dist)
    }
    fs.writeFileSync(name, content)
}

var assets = module.exports = {
    css: function(name) {
        return _getFileHander(name, 'css')
    },
    js: function(name) {
        return _getFileHander(name, 'js')
    }
}

var _getFileHander = function(name, type) {
    if (ASSETCONFIG.debug) {
        return ASSETCONFIG.rev[type][name].src
    } else {
        return [asset[type][name]]
    }
}

var assetFile = (function() {
    var process = function(name, type) {
        var tmp = getRevFile(name, type)
            // console.log(getHash(tmp))
        file = updateFilename(name, getHash(tmp).substr(0, 8), type)
            // 生成文件
            // asset[type][name] = '/' + file.replace(prefix, '')
        asset[type][name] = file
        var content = getEntry(tmp, type)
        genFile(file, content)
    }
    return function(files, type) {
        for (var i in files) {
            process(i, type)
        }
    }
})()

Object.defineProperty(assets, 'config', {
    writable: false,
    configurable: false,
    enumerable: false,
    value: function(obj) {
        Object.assign(ASSETCONFIG, obj)
        if (!ASSETCONFIG.debug) {
            for (var i in ASSETCONFIG.rev) {
                assetFile(ASSETCONFIG.rev[i], i)
            }
        }
    }
})