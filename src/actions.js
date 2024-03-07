module.exports = {
	/**
	 * Get the available actions.
	 *
	 * @returns {Object[]} the available actions
	 * @access public
	 * @since 1.0.0
	 */

	initActions() {
		let self = this // required to have reference to outer `this`

		var actions = {}
		actions['start'] = {
			name: 'Start or Pause',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: this.feedbackTimerState.active ? 'pause' : 'start' })
			},
		}
		actions['pause'] = {
			name: 'Start or Pause',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'pause' })
			},
		}

		actions['reset'] = {
			name: 'Reset or Restart',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'reset' })
			},
		}
		actions['resetPause'] = {
			name: 'Reset and Pause',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'pause' })
				this.sendCommand('updateTimer', { cmd: 'reset' })
			},
		}
		actions['setMinSec'] = {
			name: 'Define time to add or reduce',
			options: [
				{
					type: 'number',
					label: 'Input Time',
					id: 'time',
				},
				{
					type: 'dropdown',
					label: 'Minutes or Seconds',
					id: 'minSec',
					default: 'sec',
					choices: [
						{ id: 'min', label: 'Minutes' },
						{ id: 'sec', label: 'Seconds' },
					],
				},
				{
					type: 'dropdown',
					label: 'Add or reduce',
					id: 'direction',
					default: 'plus',
					choices: [
						{ id: 'plus', label: 'Add' },
						{ id: 'minus', label: 'Reduce' },
					],
				},
			],
			callback: (action) => {
				let opt = action.options
				let cmd = opt.direction
				let value = opt.minSec == 'sec' || opt.time == 0 ? opt.time : opt.time * 60
				this.sendCommand('updateTimer', { cmd, value })
			},
		}
		actions['setMessage'] = {
			name: 'Define Message to send to Stage',
			options: [
				{
					type: 'textinput',
					label: 'Input Message',
					id: 'message',
				},
			],
			callback: (action) => {
				let opt = action.options
				let cmd = 'text'
				let value = opt.message
				this.sendCommand('updateTimer', { cmd, value })
			},
		}
		actions['preset'] = {
			name: 'Chose Preset',
			options: [
				{
					type: 'number',
					label: 'Preset ID',
					id: 'presetID',
				},
				{
					type: 'checkbox',
					label: 'Direct Call',
					id: 'directCall',
					default: false,
				},
			],
			callback: (action) => {
				let opt = action.options
				let cmd = 'preset'
				let value = {
					presetID: parseInt(opt.presetID),
					directCall: opt.directCall,
				}
				console.log(value)
				this.sendCommand('updateTimer', { cmd, value })
			},
		}
		actions['timerBlink'] = {
			label: 'Send / Hide message to stage',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'timerBlink', value: this.feedbackTimerState.timerBlink ? false : true })
			},
		}
		actions['showText'] = {
			label: 'Send / Hide message to stage',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'showText', value: this.feedbackTimerState.showText ? false : true })
			},
		}
		actions['showTimer'] = {
			label: 'Show / Hide Timer',
			callback: (action) => {
				this.sendCommand('updateTimer', {
					cmd: 'showTimer',
					value: this.feedbackTimerState.showTimer ? false : true,
				})
			},
		}
		actions['showTime'] = {
			label: 'Show / Hide current time',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'showTime', value: this.feedbackTimerState.showTime ? false : true })
			},
		}
		actions['showDate'] = {
			label: 'Show / Hide current date',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'showDate', value: this.feedbackTimerState.showDate ? false : true })
			},
		}
		actions['blackout'] = {
			label: 'Blackout',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'blackout', value: this.feedbackTimerState.blackout ? false : true })
			},
		}
		actions['flash'] = {
			label: 'Flash',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'flash', value: this.feedbackTimerState.flash ? false : true })
			},
		}

		self.setActionDefinitions(actions)
	},
}
