const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: {
        imageTransitions: path.resolve(__dirname, "../src/image-transitions/index.jsx")
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, "../dist")
    },
    devtool: "source-map",
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../src/index.html"),
            filename: "index.html",
            chunks: []
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../src/image-transitions/index.html"),
            filename: "image-transitions/index.html",
            chunks: ["imageTransitions"],
            minify: true
        }),
        // new MiniCSSExtractPlugin()
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: path.resolve(__dirname, "../src"),
                exclude: path.resolve(__dirname, "../node_modules"),
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    targets: "defaults"
                                }
                            ],
                            [
                                "@babel/preset-react",
                                {
                                    "runtime": "automatic"
                                }
                            ]
                        ]
                    }
                },
            }, {
                test: /\.(jpg|png|jpeg|gif|svg)$/,
                type: "asset/resource",
                generator: {
                    filename: "assets/images/[name][ext]"
                }
            }, {
                test: /\.(ttf|eot|woff|woff2)$/,
                type: "asset/resource",
                generator: {
                    filename: "assets/fonts/[name][ext]"
                }
            }, {
                test: /\.(glsl|vs|fs|frag)$/,
                exclude: path.resolve(__dirname, "../node_modules"),
                type: "asset/source"
            }
        ]
    }
}