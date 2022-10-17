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

		feedbacks['timerActive'] = {
			type: 'boolean',
			label: 'Change style of button when timer is active',
			callback: (feedback) => {
				let state = this.feedbackTimerState
				if (state.active) {
					return true
				} else {
					return false
				}
			}
		}

		feedbacks['btnActive'] = {
			type: 'boolean',
			label: 'Change message button color',
			callback: (feedback) => {
				let state = this.feedbackTimerState
				if (state[feedback.options.key]) {
					return true
				} else {
					return false
				}
			}
		}

		return feedbacks;
	}
}
