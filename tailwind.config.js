module.exports = {
	purge: {
    	enabled: true,
    	content: [
			'./src/*.html',
			'./src/*.tsx',
			'./src/*.jsx',
			'./src/*.vue',
		],
  	},
	future: {
    	removeDeprecatedGapUtilities: true,
  	},
  	theme: {
    	container: {
      		center: true
    	}
  	}
}
