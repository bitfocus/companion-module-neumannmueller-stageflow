module.exports = {

	/**
	* Get the available actions.
	*
	* @returns {Object[]} the available actions
	* @access public
	* @since 1.0.0
	*/

	getActions() {
		var actions = {};
		actions['start'] = { label: 'Start or Pause' }
		actions['reset'] = { label: 'Reset or Restart' }
		actions['setMinSec'] = {
			label: 'Define time to add or reduce',
			options: [
				{
					type: 'number',
					label: 'Input Time',
					id: 'time'
				}, {
					type: 'dropdown',
					label: 'Minutes or Seconds',
					id: 'minSec',
					default: 'sec',
					choices: [
						{ id: 'min', label: 'Minutes' },
						{ id: 'sec', label: 'Seconds' },
					]
				},
				{
					type: 'dropdown',
					label: 'Add or reduce',
					id: 'direction',
					default: 'plus',
					choices: [
						{ id: 'plus', label: 'Add' },
						{ id: 'minus', label: 'Reduce' },
					]
				},
			]
		}
		actions['setMessage'] = {
			label: 'Define Message to send to Stage',
			options: [
				{
					type: 'textinput',
					label: 'Input Message',
					id: 'message'
				}
			]
		}
		actions['preset'] = {
			label: 'Chose Preset',
			options: [
				{
					type: 'number',
					label: 'Preset ID',
					id: 'presetID'
				},
				{
					type: 'checkbox',
					label: 'Direct Call',
					id: 'directCall',
					default: false
				}
			]
		}
		actions['timerBlink'] = { label: 'Send / Hide message to stage' }
		actions['showText'] = { label: 'Send / Hide message to stage' }
		actions['showTimer'] = { label: 'Show / Hide Timer' }
		actions['showTime'] = { label: 'Show / Hide current time' }
		actions['showDate'] = { label: 'Show / Hide current date' }
		actions['blackout'] = { label: 'Blackout' }
		actions['flash'] = { label: 'Flash' }


		return actions;
	}
}
