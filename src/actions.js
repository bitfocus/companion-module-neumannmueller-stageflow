const MODE_OPTION = {
	type: 'dropdown',
	id: 'mode',
	label: 'Mode',
	default: 'toggle',
	choices: [
		{ id: 'toggle', label: 'Toggle' },
		{ id: 'on', label: 'On' },
		{ id: 'off', label: 'Off' },
	],
}

const MIN_SEC_OPTION = {
	type: 'dropdown',
	id: 'minSec',
	label: 'Minutes or Seconds',
	default: 'sec',
	choices: [
		{ id: 'min', label: 'Minutes' },
		{ id: 'sec', label: 'Seconds' },
	],
}

const toMs = (time, minSec) => {
	const t = Number(time) || 0
	return minSec === 'min' ? t * 60 * 1000 : t * 1000
}
const toSeconds = (time, minSec) => {
	const t = Number(time) || 0
	return minSec === 'min' ? t * 60 : t
}

/**
 * Commands the server treats as unconditional toggles (the sent value is
 * ignored by unpatched Stageflow apps; patched apps assign a boolean value).
 * Mode 'toggle' therefore sends the bare command; 'on'/'off' send a boolean.
 */
const serverToggle = (self, cmd, name, description) => ({
	name,
	description,
	options: [MODE_OPTION],
	callback: (action) => {
		const mode = action.options?.mode ?? 'toggle'
		if (mode === 'toggle') self.sendTimerCmd(cmd)
		else self.sendTimerCmd(cmd, mode === 'on')
	},
})

/**
 * Commands the server assigns from the sent value on every app version
 * (showText, showFullscreenText, flash, blackout).
 */
const assignToggle = (self, cmd, name, description) => ({
	name,
	description,
	options: [MODE_OPTION],
	callback: (action) => {
		const mode = action.options?.mode ?? 'toggle'
		const value = mode === 'toggle' ? !self.timerData?.[cmd] : mode === 'on'
		self.sendTimerCmd(cmd, value)
	},
})

export function getActionDefinitions(self) {
	return {
		// Timer control /////////////////////////////////////////////////////
		startPause: {
			name: 'Start or Pause',
			options: [],
			callback: () => {
				self.sendTimerCmd(self.timerData?.active ? 'pause' : 'start')
			},
		},
		start: {
			name: 'Start',
			options: [],
			callback: () => self.sendTimerCmd('start'),
		},
		pause: {
			name: 'Pause',
			options: [],
			callback: () => self.sendTimerCmd('pause'),
		},
		reset: {
			name: 'Reset or Restart',
			options: [],
			callback: () => self.sendTimerCmd('reset'),
		},
		resetPause: {
			name: 'Reset and Pause',
			options: [],
			callback: () => {
				self.sendTimerCmd('pause')
				self.sendTimerCmd('reset')
			},
		},
		clear: {
			name: 'Clear timer',
			description: 'Resets input time, warn time and count to zero (only while the timer is not running)',
			options: [],
			callback: () => self.sendTimerCmd('clear'),
		},
		countDown: {
			name: 'Set direction: count down',
			description: 'Only while the timer is not running',
			options: [],
			callback: () => self.sendTimerCmd('countDown'),
		},
		countUp: {
			name: 'Set direction: count up',
			description: 'Only while the timer is not running',
			options: [],
			callback: () => self.sendTimerCmd('countUp'),
		},
		setMinSec: {
			name: 'Add or reduce time',
			options: [
				{ type: 'number', label: 'Input Time', id: 'time', default: 0, min: 0, max: 86400 },
				MIN_SEC_OPTION,
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
				const opt = action.options
				self.sendTimerCmd(opt.direction === 'minus' ? 'minus' : 'plus', toSeconds(opt.time, opt.minSec))
			},
		},
		setWarnTime: {
			name: 'Set warn time',
			options: [{ type: 'number', label: 'Warn Time', id: 'time', default: 0, min: 0, max: 86400 }, MIN_SEC_OPTION],
			callback: (action) => {
				self.sendTimerCmd('warnTime', toMs(action.options.time, action.options.minSec))
			},
		},
		clearWarnTime: {
			name: 'Clear warn time',
			options: [],
			callback: () => self.sendTimerCmd('clearWarnTime'),
		},
		customPreset: {
			name: 'Define Preset',
			options: [
				{ type: 'number', label: 'Input Time', id: 'time', default: 0, min: 0, max: 86400 },
				MIN_SEC_OPTION,
				{ type: 'number', label: 'Warntime in Seconds', id: 'warnTime', default: 0, min: 0, max: 86400 },
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
				{ type: 'checkbox', label: 'Direct Call', id: 'directCall', default: false },
			],
			callback: (action) => {
				const opt = action.options
				self.sendTimerCmd('pause')
				self.sendTimerCmd(opt.direction === 'countUp' ? 'countUp' : 'countDown')
				self.sendTimerCmd('warnTime', (Number(opt.warnTime) || 0) * 1000)
				self.sendTimerCmd('inputTime', toMs(opt.time, opt.minSec))
				self.sendTimerCmd('reset')
				if (opt.directCall) {
					setTimeout(() => self.sendTimerCmd('start'), 200)
				}
			},
		},
		preset: {
			name: 'Choose Preset',
			options: [
				{ type: 'number', label: 'Preset ID (starts at 0)', id: 'presetID', default: 0, min: 0, max: 999 },
				{ type: 'checkbox', label: 'Direct Call', id: 'directCall', default: false },
			],
			callback: (action) => {
				const opt = action.options
				const presetID = parseInt(opt.presetID, 10)
				if (!Number.isFinite(presetID) || presetID < 0) {
					self.log('warn', `Invalid preset ID: ${opt.presetID}`)
					return
				}
				self.sendTimerCmd('pause')
				self.sendTimerCmd('preset', { presetID, directCall: !!opt.directCall })
				if (!opt.directCall) self.sendTimerCmd('reset')
			},
		},

		// Messages //////////////////////////////////////////////////////////
		setMessage: {
			name: 'Define Message to send to Stage',
			options: [{ type: 'textinput', label: 'Input Message', id: 'message', default: '', useVariables: true }],
			callback: (action) => self.sendTimerCmd('text', action.options.message ?? ''),
		},
		setFullscreenMessage: {
			name: 'Define fullscreen message to send to stage',
			options: [
				{ type: 'textinput', label: 'Input Fullscreen Message', id: 'message', default: '', useVariables: true },
			],
			callback: (action) => self.sendTimerCmd('fullscreenText', action.options.message ?? ''),
		},
		showText: assignToggle(self, 'showText', 'Show / Hide message on stage'),
		showFullscreenText: assignToggle(self, 'showFullscreenText', 'Show / Hide fullscreen message on stage'),

		// Display control ///////////////////////////////////////////////////
		showTimer: serverToggle(self, 'showTimer', 'Show / Hide Timer'),
		showTime: serverToggle(self, 'showTime', 'Show / Hide current time'),
		showDate: serverToggle(self, 'showDate', 'Show / Hide current date'),
		showTimeBar: serverToggle(self, 'showTimeBar', 'Show / Hide time bar'),
		showMinus: serverToggle(self, 'showMinus', 'Show / Hide minus sign in overtime'),
		showInSeconds: serverToggle(self, 'showInSeconds', 'Show timer in seconds'),
		showLeadingZerosMinutes: serverToggle(self, 'showLeadingZerosMinutes', 'Show leading zeros (minutes)'),
		showLeadingZerosHours: serverToggle(self, 'showLeadingZerosHours', 'Show leading zeros (hours)'),
		timerBlink: serverToggle(self, 'timerBlink', 'Blink screen when time is up'),
		backgroundBlink: serverToggle(self, 'backgroundBlink', 'Blink background when time is up'),
		stopAt0: serverToggle(self, 'stopAt0', 'Stop timer at 0 (no overtime count)'),
		syncSeconds: serverToggle(self, 'syncSeconds', 'Sync seconds display'),
		ntpSync: serverToggle(self, 'ntpSync', 'NTP time sync'),
		blackout: assignToggle(self, 'blackout', 'Blackout'),
		flash: assignToggle(self, 'flash', 'Flash'),
	}
}
