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
    dist: 'dist',
    hashLength: 5,
    debug: process.env.NODE_ENV === 'production' ? false : true
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

function resolveFile(file) {
    // console.log(path.resolve(ASSETCONFIG.publicPath))
    return path.join(ASSETCONFIG.publicPath, file)
}


function getEntry(rev, type) {
    // 压缩，合并
    var content = rev.map(function(file) {
        // file = prefix + file
        return fs.readFileSync(resolveFile(file)).toString()
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
        return md5(fs.readFileSync(resolveFile(file)))
    }).join(''))
}

function md5(str) {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex')
}

function genFile(name, content) {
    var dist = path.join(ASSETCONFIG.publicPath, ASSETCONFIG.dist)
    if (!fs.existsSync(dist)) {
        fs.mkdirSync(dist)
    }
    fs.writeFileSync(path.join(dist, name), content)
}

function _getFileHander(name, type) {
    if (ASSETCONFIG.debug) {
        return ASSETCONFIG.rev[type][name].src
    } else {
        return [asset[type][name]]
    }
}

var assetFile = (function() {
    var process = function(name, type) {
        var tmp = getRevFile(name, type),
            filename = [name, getHash(tmp).substr(0, ASSETCONFIG.hashLength), type].join('.')
            // console.log(getHash(tmp))
        asset[type][name] = ASSETCONFIG.dist + '/' + filename
        genFile(filename, getEntry(tmp, type))
    }
    return function(files, type) {
        Object.keys(files).forEach(function(i) {
            process(i, type)
        })
    }
})()

var assets = module.exports = {
    css: function(name) {
        return _getFileHander(name, 'css')
    },
    js: function(name) {
        return _getFileHander(name, 'js')
    }
}

Object.defineProperty(assets, 'config', {
    writable: false,
    configurable: false,
    enumerable: false,
    value: function(obj) {
        Object.assign(ASSETCONFIG, obj)
        ASSETCONFIG.staticPathName = path.basename(obj.publicPath)
        ASSETCONFIG.rev = JSON.parse(fs.readFileSync(ASSETCONFIG.rev))
        if (!ASSETCONFIG.debug) {
            Object.keys(ASSETCONFIG.rev).forEach(function(i) {
                assetFile(ASSETCONFIG.rev[i], i)
            })
        }
    }
})