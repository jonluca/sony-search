module.exports = {
    plugins: [
        require('@tailwindcss/custom-forms')
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
            whitelist: [
                'opacity-50',
                'cursor-not-allowed',
                'hover:bg-blue-700'
            ],
        },
    },
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true
    },
    theme: {
        container: {
            center: true
        }
    }
}
