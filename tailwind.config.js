module.exports = {
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
				'hover:bg-blue-700',
				'border-red-500',
				'grid',
				'hidden',
				'block',
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
