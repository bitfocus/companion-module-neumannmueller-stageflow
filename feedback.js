const { size } = require("lodash");

module.exports = {

	/**
	* Get the available feedbacks.
	*
	* @returns {Object[]} the available feedbacks
	* @access public
	* @since 1.0.0
	*/
	getFeedbacks() {
		var feedbacks = {}

		feedbacks['start_btn'] = {
			type: 'advanced',
			label: 'Change start button color',
			options: [
				{
					type: 'colorpicker',
					label: 'Running: Foreground color',
					id: 'active_fg',
					default: this.rgb(0, 0, 0),
				},
				{
					type: 'colorpicker',
					label: 'Running: Background color',
					id: 'active_bg',
					default: this.rgb(255, 255, 0),
				},
				{
					type: 'colorpicker',
					label: 'Paused: Foreground color',
					id: 'paused_fg',
					default: this.rgb(0, 0, 0),
				},
				{
					type: 'colorpicker',
					label: 'Paused: Background color',
					id: 'paused_bg',
					default: this.rgb(255, 255, 0),
				},
				{
					type: 'colorpicker',
					label: 'Stoped: Foreground color',
					id: 'stoped_fg',
					default: this.rgb(0, 0, 0)
				},
				{
					type: 'colorpicker',
					label: 'Stoped: Background color',
					id: 'stoped_bg',
					default: this.rgb(0, 255, 0)
				}
			],
			callback: (feedback, bank) => {
				let state = this.feedbackTimerState
				if (state.active) {
					return {
						color: feedback.options.active_fg,
						bgcolor: feedback.options.active_bg,
						text: 'PAUSE',
					};
				}
				else if (!state.active) {
					return {
						color: feedback.options.stoped_fg,
						bgcolor: feedback.options.stoped_bg,
					};
				}
			}
		}
		feedbacks['reset_btn'] = {
			label: 'Change pause button color',
			options: [],
			callback: (feedback, bank) => {
				let state = this.feedbackTimerState
				if (state.active && !state.pause) {
					return {
						text: 'RESTART',
						size: '14'
					};
				}
			}
		}

		feedbacks['btn_active'] = {
			label: 'Change message button color',
			options: [
				{
					type: 'colorpicker',
					label: 'Active: Foreground color',
					id: 'active_fg',
					default: this.rgb(0, 0, 0),
				},
				{
					type: 'colorpicker',
					label: 'Active: Background color',
					id: 'active_bg',
					default: this.rgb(0, 255, 0),
				},
			],
			callback: (feedback, bank) => {
				let state = this.feedbackTimerState
				if (state[feedback.options.key]) {
					return {
						color: feedback.options.active_fg,
						bgcolor: feedback.options.active_bg,
					};
				}
			}
		}

		feedbacks['setMinSec'] = {
			label: 'Changes color of Button if its title is not default',
			options: [
				{
					type: 'colorpicker',
					label: 'Button background of probably seted button text',
					id: 'bgColor',
					default: this.rgb(255, 255, 0)

				},
			],
			callback: (feedback, bank) => {
				console.log(bank);
				if (bank.text != 'Set x Seconds or Minutes') {
					return {
						bgcolor: feedback.options.bgColor
					};
				}
			}
		}

		feedbacks['preset'] = {
			label: 'Changes color of Button if its title is not default',
			options: [
				{
					type: 'colorpicker',
					label: 'Button background of probably seted button text',
					id: 'bgColor',
					default: this.rgb(255, 255, 0)

				},
			],
			callback: (feedback, bank) => {
				console.log(bank);
				if (bank.text != 'Define Preset') {
					return {
						bgcolor: feedback.options.bgColor
					};
				}
			}
		}

		feedbacks['setMessage'] = {
			label: 'Changes color of Button if its title is not default',
			options: [
				{
					type: 'colorpicker',
					label: 'Button background of probably seted button text',
					id: 'bgColor',
					default: this.rgb(255, 255, 0)

				},
			],
			callback: (feedback, bank) => {
				if (bank.text != 'Message - Please change text') {
					return {
						bgcolor: feedback.options.bgColor
					};
				}
			}
		}

		return feedbacks;
	}
}
