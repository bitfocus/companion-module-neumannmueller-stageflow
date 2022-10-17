module.exports = {

	/**
	* Get the available presets.
	*
	* @returns {Object[]} the available feedbacks
	* @access public
	* @since 1.0.0
	*/

	getPresets(updates) {
		var presets = [];

		presets.push({
			category: 'Timer Control',
			label: 'Start/Pause Timer',
			bank: {
				style: 'text',
				text: 'START',
				size: '18',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(0, 255, 0),
			},
			actions: [
				{
					action: 'start',
				},
			],
			feedbacks: [
				{
					type: 'timerActive',
					style: {
						text: 'PAUSE',
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(255, 255, 0)
					},
				}
			]
		});

		presets.push({
			category: 'Timer Control',
			label: 'Restart/Reset Timer',
			bank: {
				style: 'text',
				text: 'RESET',
				size: '18',
				color: this.rgb(182, 182, 182),
				bgcolor: this.rgb(0, 0, 0)
			},
			actions: [
				{
					action: 'reset'
				}
			],
			feedbacks: [
				{
					type: 'timerActive',
					style: {
						text: 'RESTART',
						size: 14
					}
				}
			]
		});

		presets.push({
			category: 'Timer Control',
			label: 'Add or reduce x time',
			bank: {
				style: 'text',
				text: 'Set x Seconds or Minutes',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 0, 255)
			},
			actions: [
				{
					action: 'setMinSec',
					options: {
						time: '0',
						minSec: 'sec',
						direction: 'plus',
					}
				},
			],
		});

		presets.push({
			category: 'Display Control',
			label: 'Show Timer',
			bank: {
				style: 'text',
				text: 'Show Timer',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0)
			},
			actions: [
				{
					action: 'showTimer'
				},
			],
			feedbacks: [
				{
					type: 'btnActive',
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0),
					},
					options: {
						key: 'showTimer'
					}
				}
			]
		});

		presets.push({
			category: 'Display Control',
			label: 'Show current time',
			bank: {
				style: 'text',
				text: 'Show Time',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0)
			},
			actions: [
				{
					action: 'showTime'
				},
			],
			feedbacks: [
				{
					type: 'btnActive',
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0),
					},
					options: {
						key: 'showTime'
					}
				}
			]
		});

		presets.push({
			category: 'Display Control',
			label: 'Show current date',
			bank: {
				style: 'text',
				text: 'Show Date',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0)
			},
			actions: [
				{
					action: 'showDate'
				},
			],
			feedbacks: [
				{
					type: 'btnActive',
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0),
					},
					options: {
						key: 'showDate'
					}
				}
			]
		});

		presets.push({
			category: 'Display Control',
			label: 'Blink when time is up',
			bank: {
				style: 'text',
				text: 'Blink on time up',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0)
			},
			actions: [
				{
					action: 'timerBlink'
				},
			],
			feedbacks: [
				{
					type: 'btnActive',
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0),
					},
					options: {
						key: 'timerBlink'
					}
				}
			]
		});

		presets.push({
			category: 'Display Control',
			label: 'Blackout',
			bank: {
				style: 'text',
				text: 'Blackout',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0)
			},
			actions: [
				{
					action: 'blackout'
				},
			],
			feedbacks: [
				{
					type: 'btnActive',
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0),
					},
					options: {
						key: 'blackout',
					}
				}
			]
		});

		presets.push({
			category: 'Display Control',
			label: 'Flash',
			bank: {
				style: 'text',
				text: 'Flash',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0)
			},
			actions: [
				{
					action: 'flash'
				},
			],
			feedbacks: [
				{
					type: 'btnActive',
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0),
					}, options: {
						key: 'flash',
					}
				}
			]
		});

		presets.push({
			category: 'Message Control',
			label: 'Send Message',
			bank: {
				style: 'text',
				text: 'Show Message',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 255, 0)
			},
			actions: [
				{
					action: 'showText'
				},
			],
			feedbacks: [
				{
					type: 'btnActive',
					style: {
						color: this.rgb(0, 0, 0),
						bgcolor: this.rgb(0, 255, 0)
					},
					options: {
						key: 'showText',
					}
				}
			]
		});

		presets.push({
			category: 'Message Control',
			label: 'Define Message',
			bank: {
				style: 'text',
				text: 'Message - Please change text',
				size: '14',
				color: this.rgb(0, 0, 0),
				bgcolor: this.rgb(255, 0, 255)
			},
			actions: [
				{
					action: 'setMessage',
					options: {
						message: 'Change Message Here',
					}
				},
			],

		});

		let sfPresets = this.stageflowPresets
		let presetID = 0
		sfPresets.forEach(preset => {
			presets.push({
				category: 'Presets',
				label: 'Use Preset',
				bank: {
					style: 'text',
					text: `$(label:preset_${presetID})`,
					size: '14',
					color: this.rgb(0, 0, 0),
					bgcolor: this.rgb(255, 255, 0)
				},
				actions: [
					{
						action: 'preset',
						options: {
							presetID: presetID,
							directCall: false,
						}
					},
				]
			});

			presetID++
		})

		return presets;
	}
};
