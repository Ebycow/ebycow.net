const webpack = require('webpack');
const path = require('path');

// Webpack Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const GoogleFontsPlugin = require("google-fonts-webpack-plugin")

module.exports = {
    mode: 'development',
    entry: './src/main.ts',

    output: {
        filename: 'bundle.js'
    },

    optimization: {
        splitChunks: {
          chunks: 'all',
        }
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.css/,
                use: [
                  'style-loader',
                  {loader: 'css-loader', options: {url: true}},
                ],
            },
            {
                test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/,
                use: 'url-loader'
            },
        ]
    },

    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules'
        ],
        extensions: [
            '.js',
            '.ts',
            '.html',
        ]
    },

    plugins: [

        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),

        // new GoogleFontsPlugin({
        //     fonts: [
        //         { family: "M PLUS Rounded 1c" },
        //     ],
        // }),
    ],

    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        port: 3000,
        open: true
    },
};