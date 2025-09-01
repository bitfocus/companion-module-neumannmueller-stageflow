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
		actions['startPause'] = {
			name: 'Start or Pause',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: this.feedbackTimerState.active ? 'pause' : 'start' })
			},
		}
		actions['start'] = {
			name: 'Start',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'start' })
			},
		}
		actions['pause'] = {
			name: 'Pause',
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
		actions['customPreset'] = {
			name: 'Define Preset',
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
					type: 'number',
					label: 'Warntime in Seconds',
					id: 'warnTime',
				},
				{
					type: 'dropdown',
					label: 'Count Up or Down',
					id: 'direction',
					default: 'countDown',
					choices: [
						{ id: 'countDown', label: 'Down' },
						{ id: 'countUp', label: 'Up' },
					],
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
				let direction = opt.direction
				let time = opt.minSec == 'sec' || opt.time == 0 ? opt.time * 1000 : opt.time * 60 * 1000
				let warnTime = opt.warnTime * 1000
				this.sendCommand('updateTimer', { cmd: 'pause' })
				this.sendCommand('updateTimer', { cmd: direction })
				this.sendCommand('updateTimer', { cmd: 'warnTime', value: warnTime })
				this.sendCommand('updateTimer', { cmd: 'inputTime', value: time })
				this.sendCommand('updateTimer', { cmd: 'reset' })

				if (opt.directCall)
					setTimeout(() => {
						this.sendCommand('updateTimer', { cmd: 'start' })
					}, 200)
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
		actions['setFullscreenMessage'] = {
			name: 'Define fullscreen message to send to stage',
			options: [
				{
					type: 'textinput',
					label: 'Input Fullscreen Message',
					id: 'message',
				},
			],
			callback: (action) => {
				let opt = action.options
				let cmd = 'fullscreenText'
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
				this.sendCommand('updateTimer', { cmd: 'pause' })
				this.sendCommand('updateTimer', { cmd, value })
				this.sendCommand('updateTimer', { cmd: 'reset' })
			},
		}
		actions['timerBlink'] = {
			name: 'Blink screen when time is up',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'timerBlink', value: this.feedbackTimerState.timerBlink ? false : true })
			},
		}
		actions['showText'] = {
			name: 'Send / Hide message to stage',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'showText', value: this.feedbackTimerState.showText ? false : true })
			},
		}
		actions['showFullscreenText'] = {
			name: 'Send / Hide fullscreen message to stage',
			callback: (action) => {
				this.sendCommand('updateTimer', {
					cmd: 'showFullscreenText',
					value: this.feedbackTimerState.showFullscreenText ? false : true,
				})
			},
		}
		actions['showTimer'] = {
			name: 'Show / Hide Timer',
			callback: (action) => {
				this.sendCommand('updateTimer', {
					cmd: 'showTimer',
					value: this.feedbackTimerState.showTimer ? false : true,
				})
			},
		}
		actions['showTime'] = {
			name: 'Show / Hide current time',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'showTime', value: this.feedbackTimerState.showTime ? false : true })
			},
		}
		actions['showDate'] = {
			name: 'Show / Hide current date',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'showDate', value: this.feedbackTimerState.showDate ? false : true })
			},
		}
		actions['blackout'] = {
			name: 'Blackout',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'blackout', value: this.feedbackTimerState.blackout ? false : true })
			},
		}
		actions['flash'] = {
			name: 'Flash',
			callback: (action) => {
				this.sendCommand('updateTimer', { cmd: 'flash', value: this.feedbackTimerState.flash ? false : true })
			},
		}

		self.setActionDefinitions(actions)
	},
}
