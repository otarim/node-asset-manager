#asset-manager

A Nodejs assets manager,allows you to switch between development and production, manager your css and js files in a single json

##How To Use

1. define your rev.json

        {
            "css": {  // type
                "all": { // name to dist file
                    "src": ["dev/1.css", "dev/2.css"] // files to combo
                }
            },
            "js": {
                "all": {
                    "src": ["dev/1.js", "dev/2.js"]
                }
            }
        }

2. assets config

        var asset = require('node-asset-manager')

        asset.config({
            rev: path.resolve(__dirname, './rev.json'), // path to rev.json
            debug: false, // isDebug mode
            dist: 'dest', // output dirname
            hashLength: 6,
            publicPath: path.resolve(__dirname, 'static/') // path to static path
        })

3. use method asset.css(name) or asset.js(name) to manager your css and js files,if debug is false, it will return comboed file

        var combocss = asset.css('all'),
            combojs = asset.js('all')

        console.log(combocss)

        // debug === true ["dest/all.[hash].css"]
        // debug === false ["dev/1.css", "dev/2.css"]

4. use in template (eg: koa-swig)

        app.context.render = swig({
            ...
            locals: {
                asset: asset
            }
        })

        {% for link in asset.css('all') %}
        <link rel="stylesheet" href="{{link}}">
        {% endfor %}
        