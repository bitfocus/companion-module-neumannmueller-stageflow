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

		feedbacks['timerActive'] = {
			type: 'boolean',
			name: 'Change style of button when timer is active',
			callback: (feedback) => {
				let state = this.feedbackTimerState
				if (feedback?.options?.key == 'timeIsNotUp') {
					if (!state.timeIsUp && state.active) {
						return true
					} else {
						return false
					}
				}
				if (feedback?.options?.key == 'timeIsUp') {
					if (state.timeIsUp && state.active) {
						return true
					} else {
						return false
					}
				}

				if (feedback?.options?.key == 'active') {
					if (state.active) {
						return true
					} else {
						return false
					}
				}
			},
		}
		feedbacks['timeIsUp'] = {
			type: 'boolean',
			name: 'Change style of button when time is up',
			callback: (feedback) => {
				let state = this.feedbackTimerState
				if (state.timeIsUp) {
					return true
				} else {
					return false
				}
			},
		}

		feedbacks['btnActive'] = {
			type: 'boolean',
			name: 'Change message button color',
			callback: (feedback) => {
				let state = this.feedbackTimerState
				if (state[feedback.options.key]) {
					return true
				} else {
					return false
				}
			},
		}

		return feedbacks
	},
}
