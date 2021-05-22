const colors = require('tailwindcss/colors');

module.exports = {
    darkMode: 'media',
    plugins: [
        require("@tailwindcss/forms")({
            strategy: 'class',
        })
    ],
    purge: {
        enabled: true,
        content: [
            './src/*.html',
            './src/*.tsx',
            './src/*.jsx',
            './src/*.vue',
        ],
        options: {
            safelist: [
                'opacity-50',
                'cursor-not-allowed',
                'hover:bg-blue-700'
            ],
        },
    },
    theme: {
        container: {
            center: true
        },
        colors: {
            transparent: 'transparent',
            current: 'currentColor',
            black: colors.black,
            white: colors.white,
            gray: colors.coolGray,
            red: colors.red,
            yellow: colors.yellow,
            blue: colors.lightBlue,
            orange: colors.orange,
            cyan: colors.cyan
        }
    }
}
