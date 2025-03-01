const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    entry: {
        fractionalEdgeWipeTransitionEffect: path.resolve(__dirname, "../src/fractional-edge-wipe-transition-effect/index.jsx"),
        verticalWipeTransition: path.resolve(__dirname, "../src/vertical-wipe-transition/index.jsx"),
        radialRippleTransition: path.resolve(__dirname, "../src/radial-ripple-transition/index.jsx"),
        waterfrontFlowTransition: path.resolve(__dirname, "../src/waterfront-flow-transition/index.jsx"),
        imageTransition: path.resolve(__dirname, "../src/image-transition/index.jsx")
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
            template: path.resolve(__dirname, "../src/fractional-edge-wipe-transition-effect/index.html"),
            filename: "fractional-edge-wipe-transition-effect/index.html",
            chunks: ["fractionalEdgeWipeTransitionEffect"],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../src/vertical-wipe-transition/index.html"),
            filename: "vertical-wipe-transition/index.html",
            chunks: ["verticalWipeTransition"],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../src/radial-ripple-transition/index.html"),
            filename: "radial-ripple-transition/index.html",
            chunks: ["radialRippleTransition"],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../src/waterfront-flow-transition/index.html"),
            filename: "waterfront-flow-transition/index.html",
            chunks: ["waterfrontFlowTransition"],
            minify: true
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../src/image-transition/index.html"),
            filename: "image-transition/index.html",
            chunks: ["imageTransition"],
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