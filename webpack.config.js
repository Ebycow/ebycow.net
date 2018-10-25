const webpack = require('webpack');
const path = require('path');

// Webpack Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ImageminWebpackPlugin } = require('imagemin-webpack');
//const GoogleFontsPlugin = require("google-fonts-webpack-plugin")

// Imagemin plugins
const imageminGifsicle = require('imagemin-gifsicle');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminMozjpg = require('imagemin-mozjpeg');
const imageminOptipng = require('imagemin-optipng');
const imageminSvgo = require('imagemin-svgo');

module.exports = {
    mode: 'development',
    entry: './src/main.ts',

    output: {
        path: path.resolve(__dirname, 'dist'),
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
                use: 'file-loader'
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

        //new webpack.optimize.AggressiveMergingPlugin(),

        new ImageminWebpackPlugin(
            {
                imageminOptions: {
                    plugins: [imageminMozjpg(), imageminOptipng()]
                }
            }
        ),

        new HtmlWebpackPlugin({
            template: "./src/index.html",
            chunks: "all",
        }),

        // new GoogleFontsPlugin({
        //     fonts: [
        //         { family: "M PLUS Rounded 1c" },
        //     ],
        // }),
    ],

    // externals: {
    //     jquery: 'jQuery'
    // },

    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        port: 3000,
        open: true
    },
};