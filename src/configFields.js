module.exports = {
	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 2.0.0
	 */
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value:
					'This module controls Stageflow timing app by <a href="https://neumannmueller.com" target="_new">Neumann&M&uuml;ller</a>.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Stageflow local domain e.g. stageflow.local',
				default: 'stageflow.local',
				width: 6,
				required: true,
			},
			{
				type: 'number',
				id: 'port',
				label: 'Stageflow port - e.g. 2703',
				default: '2703',
				min: '1',
				max: '65535',
				width: 6,
				required: true,
			},
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Feedback',
				value:
					'Please send feedback to this module to <a href="mailto:dle-support@neumannmueller.com">dle-support@neumannmueller.com</a> ',
			},
		]
	},
}
