const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "../src/index.jsx"),
    output: {
        filename: "bundle.[contenthash].js",
        path: path.resolve(__dirname, "../dist")
    },
    devtool: "source-map",
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, "../static/**/*"),
                noErrorOnMissing: true
            }]
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../index.html"),
            minify: true
        }),
        new MiniCSSExtractPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: ["html-loader"]
            }, {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            ["@babel/preset-react", {"runtime": "automatic"}]
                        ]
                    }
                },
                resolve: { extensions: [".js", ".jsx"] }
            }, {
                test: /\.css$/,
                use: [MiniCSSExtractPlugin.loader, "css-loader"]
            }, {
                test: /\.(jpg|png|gif|svg)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: "assets/images/"
                        }
                    }
                ]
            }, {
                test: /\.(ttf|eot|woff|woff2)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            outputPath: "assets/fonts/"
                        }
                    }
                ]
            }, {
                test: /\.(glsl|vs|fs|frag)$/,
                exclude: /node_modules/,
                use: ["raw-loader"]
            }
        ]
    }
}