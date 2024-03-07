const { combineRgb } = require('@companion-module/base')

module.exports = {
	/**
	 * Get the available presets.
	 *
	 * @returns {Object[]} the available feedbacks
	 * @access public
	 * @since 1.0.0
	 */

	getPresets(stageflowPresets) {
		const presets = []
		presets.push({
			type: 'button',
			category: 'Timer Control',
			name: 'Start/Pause Timer',
			style: {
				text: 'START\npause',
				size: 'auto',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'start',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'timerActive',
					style: {
						text: 'PAUSE\nstart',
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
				},
			],
		})
		presets.push({
			type: 'button',
			category: 'Timer Control',
			name: 'Pause Timer',
			style: {
				text: 'PAUSE',
				size: '18',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'pause',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'timerActive',
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Timer Control',
			name: 'Restart/Reset Timer',
			style: {
				style: 'text',
				text: 'RESET',
				size: '18',
				color: combineRgb(182, 182, 182),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'reset',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'timerActive',
					style: {
						text: 'RESTART',
						size: 14,
					},
				},
			],
		})
		presets.push({
			type: 'button',
			category: 'Timer Control',
			name: 'Reset & Pause Timer',
			style: {
				style: 'text',
				text: 'RESET\nPause',
				size: 'auto',
				color: combineRgb(182, 182, 182),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'resetPause',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'timerActive',
					style: {
						text: 'RESTART',
						size: 14,
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Timer Control',
			name: 'Add or reduce x time',
			style: {
				style: 'text',
				text: 'Set x Seconds or Minutes',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 255),
			},
			steps: [
				{
					down: [
						{
							actionId: 'setMinSec',
							options: {
								time: '0',
								minSec: 'sec',
								direction: 'plus',
							},
						},
					],
					up: [],
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Display Control',
			name: 'Show Timer',
			style: {
				style: 'text',
				text: 'Show Timer',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'showTimer',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'btnActive',
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					options: {
						key: 'showTimer',
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Display Control',
			name: 'Show current time',
			style: {
				style: 'text',
				text: 'Show Time',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'showTime',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'btnActive',
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					options: {
						key: 'showTime',
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Display Control',
			name: 'Show current date',
			style: {
				style: 'text',
				text: 'Show Date',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'showDate',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'btnActive',
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					options: {
						key: 'showDate',
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Display Control',
			name: 'Blink when time is up',
			style: {
				style: 'text',
				text: 'Blink on time up',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'timerBlink',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'btnActive',
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					options: {
						key: 'timerBlink',
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Display Control',
			name: 'Blackout',
			style: {
				style: 'text',
				text: 'Blackout',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'blackout',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'btnActive',
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					options: {
						key: 'blackout',
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Display Control',
			name: 'Flash',
			style: {
				style: 'text',
				text: 'Flash',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'flash',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'btnActive',
					style: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					options: {
						key: 'flash',
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Message Control',
			name: 'Send Message',
			style: {
				style: 'text',
				text: 'Show Message',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'showText',
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'btnActive',
					style: {
						text: 'Hide Message',
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					options: {
						key: 'showText',
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Message Control',
			name: 'Define Message',
			style: {
				style: 'text',
				text: 'Message - Please change text',
				size: '14',
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 0, 255),
			},
			steps: [
				{
					down: [
						{
							actionId: 'setMessage',
							options: {
								message: 'Change Message Here',
							},
						},
					],
					up: [],
				},
			],
		})

		let sfPresets = stageflowPresets || []
		let presetID = 0
		if (sfPresets.length >= 1)
			sfPresets?.forEach((preset) => {
				presets.push({
					type: 'button',
					category: 'Presets',
					name: 'Use Preset',
					style: {
						style: 'text',
						text: `$(generic-module:preset_${presetID})`,
						size: 'auto',
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(255, 255, 0),
					},
					steps: [
						{
							down: [
								{
									actionId: 'preset',
									options: {
										presetID,
										directCall: false,
									},
								},
							],

							up: [],
						},
					],
				})

				presetID++
			})

		return presets
	},
}
