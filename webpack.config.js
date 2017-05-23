const path = require('path');

module.exports = {
    entry: {
        app: path.join(__dirname, 'src/app.js'),
        background: path.join(__dirname, 'src/background.js')
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'umd',
    },
    // watch: true,
    target: 'electron-main',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    }
}