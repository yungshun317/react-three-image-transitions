const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.config.js");
const path = require("path");

module.exports = merge(
    commonConfiguration,
    {
        mode: "development",
        devServer: {
            watchFiles: ["src/**/*"],
            static: {
                directory: path.resolve(__dirname, "../dist"),
                watch: true
            },
            hot: true,
            compress: true,
            port: 3000,
            open: true,
            historyApiFallback: true
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: ["postcss-preset-env", "autoprefixer"]
                                }
                            }
                        },
                        "sass-loader"
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: ["postcss-preset-env", "autoprefixer"]
                                }
                            }
                        },
                    ]
                }
            ]
        }
    },
)