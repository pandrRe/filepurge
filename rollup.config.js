
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

module.exports = {
    input: "./src/index.ts",
    output: [
        {
            file: "./dist.js",
            format: "iife",
            name: "filepurge",
        },
    ],
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    module: "ES2015",
                    declaration: false,
                }
            }
        }),
        terser({
            compress: true,
            mangle: true,
        }),
    ],
};
