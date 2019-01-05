const webpack = require('webpack');
const path = require('path');
const dateUtils = require('date-utils');

// Webpack Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ImageminWebpackPlugin } = require('imagemin-webpack');
const UglifyJsWebpackPlugin = require('uglifyjs-webpack-plugin');
// const ZipWebpackPlugin = require('zip-webpack-plugin');
//const GoogleFontsPlugin = require("google-fonts-webpack-plugin")

// Imagemin plugins
const imageminGifsicle = require('imagemin-gifsicle');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminMozjpg = require('imagemin-mozjpeg');
const imageminOptipng = require('imagemin-optipng');
const imageminSvgo = require('imagemin-svgo');

module.exports = {
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, 'src' , 'main.ts')
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },

    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            name: 'vendor',
            chunks: 'all',
        },
        minimizer: [new UglifyJsWebpackPlugin()],
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
                    {
                        loader: 'css-loader',
                        options: {
                            url: true
                        }
                    },
                ],
            },
            {
                test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'images/[name].[ext]',
                    }
                }
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
            template: path.resolve(__dirname, 'src' , 'index.html'),
        }),


        // new GoogleFontsPlugin({
        //     fonts: [
        //         { family: "M PLUS Rounded 1c" },
        //     ],
        // }),

        
        // new ZipWebpackPlugin({
        //     path: 'zip',
        //     filename: (() => {
        //         const date = new Date();
        //         const formatted = date.toFormat("YYYYMMDDHH24MISS");
        //         return `${formatted}.zip`;

        //     })()
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