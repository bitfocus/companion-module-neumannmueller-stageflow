import { combineRgb } from '@companion-module/base'

export const FEEDBACK_IDS = ['timerActive', 'timeIsUp', 'btnActive', 'warnZone']

const BTN_ACTIVE_KEYS = [
	{ id: 'showText', label: 'Message shown' },
	{ id: 'showFullscreenText', label: 'Fullscreen message shown' },
	{ id: 'showTimer', label: 'Timer shown' },
	{ id: 'showTime', label: 'Current time shown' },
	{ id: 'showTimeBar', label: 'Time bar shown' },
	{ id: 'showDate', label: 'Date shown' },
	{ id: 'showMinus', label: 'Minus sign shown' },
	{ id: 'showInSeconds', label: 'Timer shown in seconds' },
	{ id: 'showLeadingZerosMinutes', label: 'Leading zeros (minutes)' },
	{ id: 'showLeadingZerosHours', label: 'Leading zeros (hours)' },
	{ id: 'stopAt0', label: 'Stop at 0' },
	{ id: 'syncSeconds', label: 'Sync seconds' },
	{ id: 'timerBlink', label: 'Blink when time is up' },
	{ id: 'backgroundBlink', label: 'Background blink' },
	{ id: 'flash', label: 'Flash' },
	{ id: 'blackout', label: 'Blackout' },
	{ id: 'ntpSync', label: 'NTP sync' },
	{ id: 'active', label: 'Timer running' },
	{ id: 'pause', label: 'Timer paused' },
]

export function getFeedbackDefinitions(self) {
	return {
		timerActive: {
			type: 'boolean',
			name: 'Timer is active',
			description: 'Change style while the timer is running',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			showInvert: true,
			options: [
				{
					type: 'dropdown',
					id: 'key',
					label: 'Condition',
					default: 'active',
					choices: [
						{ id: 'active', label: 'Timer running' },
						{ id: 'timeIsNotUp', label: 'Timer running, time not up' },
						{ id: 'timeIsUp', label: 'Timer running, time is up' },
					],
				},
			],
			callback: (feedback) => {
				const active = !!self.timerData?.active
				const timeIsUp = !!self.derived?.timeIsUp
				switch (feedback.options?.key) {
					case 'timeIsUp':
						return active && timeIsUp
					case 'timeIsNotUp':
						return active && !timeIsUp
					default:
						return active
				}
			},
		},
		timeIsUp: {
			type: 'boolean',
			name: 'Time is up',
			description: 'Change style when the countdown has reached zero',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 0),
			},
			showInvert: true,
			options: [],
			callback: () => !!self.derived?.timeIsUp,
		},
		warnZone: {
			type: 'boolean',
			name: 'Warn time reached',
			description: 'Change style when the countdown enters the warn time',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 128, 0),
			},
			showInvert: true,
			options: [],
			callback: () => !!self.derived?.warnZone,
		},
		btnActive: {
			type: 'boolean',
			name: 'Stageflow state is on',
			description: 'Change style when a Stageflow display/message state is enabled',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			showInvert: true,
			options: [
				{
					type: 'dropdown',
					id: 'key',
					label: 'State',
					default: 'showText',
					choices: BTN_ACTIVE_KEYS,
				},
			],
			callback: (feedback) => !!self.timerData?.[feedback.options?.key],
		},
	}
}
