import { combineRgb } from '@companion-module/base'

const BLACK = combineRgb(0, 0, 0)
const GRAY = combineRgb(182, 182, 182)
const GREEN = combineRgb(0, 255, 0)
const YELLOW = combineRgb(255, 255, 0)
const RED = combineRgb(255, 0, 0)
const ORANGE = combineRgb(255, 128, 0)
const MAGENTA = combineRgb(255, 0, 255)

/** Simple one-action button preset. */
const button = (name, style, actions, feedbacks = []) => ({
	type: 'simple',
	name,
	style,
	steps: [{ down: actions, up: [] }],
	feedbacks,
})

/** Preset for a server/assign toggle action with btnActive feedback. */
const togglePreset = (actionId, text, feedbackKey = actionId) =>
	button(
		text,
		{ text, size: '14', color: BLACK, bgcolor: YELLOW },
		[{ actionId, options: { mode: 'toggle' } }],
		[
			{
				feedbackId: 'btnActive',
				options: { key: feedbackKey },
				style: { color: BLACK, bgcolor: GREEN },
			},
		],
	)

/** Timer display preset showing one variable, colored by timer state. */
const displayPreset = (name, text, size = 'auto') =>
	button(
		name,
		{ text, size, color: BLACK, bgcolor: GRAY },
		[],
		[
			{
				feedbackId: 'timerActive',
				options: { key: 'timeIsNotUp' },
				style: { color: BLACK, bgcolor: GREEN },
			},
			{
				feedbackId: 'warnZone',
				options: {},
				style: { color: BLACK, bgcolor: ORANGE },
			},
			{
				feedbackId: 'timeIsUp',
				options: {},
				style: { color: BLACK, bgcolor: RED },
			},
		],
	)

export function buildPresets(self) {
	const label = self.label
	const v = (variableId) => `$(${label}:${variableId})`

	const presets = {
		// Timer Control /////////////////////////////////////////////////////
		startPause: button(
			'Start/Pause Timer',
			{ text: 'START\npause', size: 'auto', color: BLACK, bgcolor: GREEN },
			[{ actionId: 'startPause', options: {} }],
			[
				{
					feedbackId: 'timerActive',
					options: { key: 'active' },
					style: { text: 'PAUSE\nstart', color: BLACK, bgcolor: YELLOW },
				},
			],
		),
		start: button(
			'Start Timer',
			{ text: 'START', size: '20', color: BLACK, bgcolor: GREEN },
			[{ actionId: 'start', options: {} }],
			[
				{
					feedbackId: 'timerActive',
					options: { key: 'active' },
					style: { text: 'Running', size: '18', color: BLACK, bgcolor: YELLOW },
				},
			],
		),
		pause: button(
			'Pause Timer',
			{ text: 'PAUSE', size: '20', color: BLACK, bgcolor: YELLOW },
			[{ actionId: 'pause', options: {} }],
			[
				{
					feedbackId: 'timerActive',
					options: { key: 'active' },
					style: { color: BLACK, bgcolor: GREEN },
				},
			],
		),
		reset: button(
			'Restart/Reset Timer',
			{ text: 'RESET', size: '18', color: GRAY, bgcolor: BLACK },
			[{ actionId: 'reset', options: {} }],
			[
				{
					feedbackId: 'timerActive',
					options: { key: 'active' },
					style: { text: 'RESTART', size: '14' },
				},
			],
		),
		resetPause: button('Reset & Pause Timer', { text: 'RESET\nPause', size: 'auto', color: GRAY, bgcolor: BLACK }, [
			{ actionId: 'resetPause', options: {} },
		]),
		addTime: button(
			'Add or reduce x time',
			{ text: 'Set x Seconds or Minutes', size: '14', color: BLACK, bgcolor: MAGENTA },
			[{ actionId: 'setMinSec', options: { time: 0, minSec: 'sec', direction: 'plus' } }],
		),
		customPreset: button('Custom Preset', { text: 'Custom Preset', size: '14', color: BLACK, bgcolor: MAGENTA }, [
			{
				actionId: 'customPreset',
				options: { time: 0, minSec: 'sec', direction: 'countDown', directCall: true, warnTime: 0 },
			},
		]),

		// Display Control ///////////////////////////////////////////////////
		showTimer: togglePreset('showTimer', 'Show Timer'),
		showTime: togglePreset('showTime', 'Show Time'),
		showDate: togglePreset('showDate', 'Show Date'),
		showTimeBar: togglePreset('showTimeBar', 'Show Time Bar'),
		showMinus: togglePreset('showMinus', 'Show Minus'),
		showInSeconds: togglePreset('showInSeconds', 'Show in Seconds'),
		stopAt0: togglePreset('stopAt0', 'Stop at 0'),
		syncSeconds: togglePreset('syncSeconds', 'Sync Seconds'),
		timerBlink: togglePreset('timerBlink', 'Blink on time up'),
		backgroundBlink: togglePreset('backgroundBlink', 'Background Blink'),
		blackout: togglePreset('blackout', 'Blackout'),
		flash: togglePreset('flash', 'Flash'),

		// Message Control ///////////////////////////////////////////////////
		showMessage: button(
			'Send prepared message',
			{ text: 'Show Message', size: '14', color: BLACK, bgcolor: YELLOW },
			[{ actionId: 'showText', options: { mode: 'toggle' } }],
			[
				{
					feedbackId: 'btnActive',
					options: { key: 'showText' },
					style: { text: 'Hide Message', color: BLACK, bgcolor: GREEN },
				},
			],
		),
		displayMessage: button(
			'Display prepared message',
			{ text: v('preparedMessage'), size: 'auto', color: BLACK, bgcolor: GRAY },
			[],
			[
				{
					feedbackId: 'btnActive',
					options: { key: 'showText' },
					style: { color: BLACK, bgcolor: GREEN },
				},
			],
		),
		defineMessage: button(
			'Define Message',
			{ text: 'Message - Please change text', size: '14', color: BLACK, bgcolor: MAGENTA },
			[{ actionId: 'setMessage', options: { message: 'Change Message Here' } }],
		),
		showFullscreen: button(
			'Send prepared fullscreen message',
			{ text: 'Show fullscreen message', size: '14', color: BLACK, bgcolor: YELLOW },
			[{ actionId: 'showFullscreenText', options: { mode: 'toggle' } }],
			[
				{
					feedbackId: 'btnActive',
					options: { key: 'showFullscreenText' },
					style: { text: 'Hide fullscreen message', color: BLACK, bgcolor: GREEN },
				},
			],
		),
		displayFullscreen: button(
			'Display prepared fullscreen message',
			{ text: v('preparedFullscreenMessage'), size: 'auto', color: BLACK, bgcolor: GRAY },
			[],
			[
				{
					feedbackId: 'btnActive',
					options: { key: 'showFullscreenText' },
					style: { color: BLACK, bgcolor: GREEN },
				},
			],
		),
		defineFullscreen: button(
			'Define fullscreen message',
			{ text: 'Fullscreen message - Please change text', size: '14', color: BLACK, bgcolor: MAGENTA },
			[{ actionId: 'setFullscreenMessage', options: { message: 'Change fullscreen message here' } }],
		),

		// Timer Display /////////////////////////////////////////////////////
		timerCombined: displayPreset('Timer combined', v('combined'), '17'),
		timerHours: displayPreset('Timer Hours', v('hours')),
		timerMinutes: displayPreset('Timer Minutes', v('minutes')),
		timerSeconds: displayPreset('Timer seconds', v('seconds')),
	}

	// Dynamic Stageflow presets /////////////////////////////////////////////
	const sfIds = []
	const sfPresets = self.stageflowPresets ?? []
	for (let i = 0; i < sfPresets.length; i++) {
		const id = `sfPreset_${i}`
		sfIds.push(id)
		presets[id] = button(
			`Use Preset: ${sfPresets[i]?.name ?? i}`,
			{ text: v(`preset_${i}`), size: 'auto', color: BLACK, bgcolor: YELLOW },
			[{ actionId: 'preset', options: { presetID: i, directCall: false } }],
		)
	}

	const structure = [
		{
			id: 'timerControl',
			name: 'Timer Control',
			definitions: ['startPause', 'start', 'pause', 'reset', 'resetPause', 'addTime', 'customPreset'],
		},
		{
			id: 'displayControl',
			name: 'Display Control',
			definitions: [
				'showTimer',
				'showTime',
				'showDate',
				'showTimeBar',
				'showMinus',
				'showInSeconds',
				'stopAt0',
				'syncSeconds',
				'timerBlink',
				'backgroundBlink',
				'blackout',
				'flash',
			],
		},
		{
			id: 'messageControl',
			name: 'Message Control',
			definitions: [
				'showMessage',
				'displayMessage',
				'defineMessage',
				'showFullscreen',
				'displayFullscreen',
				'defineFullscreen',
			],
		},
		...(sfIds.length ? [{ id: 'sfPresets', name: 'Stageflow Presets', definitions: sfIds }] : []),
		{
			id: 'timerDisplay',
			name: 'Timer Display',
			definitions: ['timerCombined', 'timerHours', 'timerMinutes', 'timerSeconds'],
		},
	]

	return { structure, presets }
}
