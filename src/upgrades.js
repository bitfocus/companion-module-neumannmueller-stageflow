/**
 * Upgrade scripts. Order and count of already-shipped scripts must never
 * change - Companion tracks how many have run per connection.
 */

/** Unwrap an ExpressionOrValue-style migration option (or pass a legacy plain value through). */
const rawValue = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v)
const wrapValue = (value) => ({ value, isExpression: false })

/** Script 0: shipped placeholder from v2.x - must stay in place. */
const script0 = () => ({
	updatedConfig: null,
	updatedActions: [],
	updatedFeedbacks: [],
})

/** Actions that gained the 'mode' option in v3.0.0. */
const MODE_ACTIONS = [
	'showTimer',
	'showTime',
	'showDate',
	'timerBlink',
	'showText',
	'showFullscreenText',
	'blackout',
	'flash',
]

/** Script 1 (v3.0.0): numeric port, 'mode' option backfill, driectCall typo fix. */
const v300 = (_context, props) => {
	const result = {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks: [],
	}

	if (props.config && typeof props.config.port === 'string') {
		result.updatedConfig = {
			...props.config,
			port: parseInt(props.config.port, 10) || 2703,
		}
	}

	for (const action of props.actions) {
		let changed = false

		if (MODE_ACTIONS.includes(action.actionId)) {
			if (!action.options) action.options = {}
			if (action.options.mode === undefined) {
				action.options.mode = wrapValue('toggle')
				changed = true
			}
		}

		// v2.x presets shipped a 'driectCall' typo on customPreset buttons
		if (action.actionId === 'customPreset' && action.options) {
			if (action.options.directCall === undefined && action.options.driectCall !== undefined) {
				action.options.directCall = wrapValue(!!rawValue(action.options.driectCall))
				delete action.options.driectCall
				changed = true
			}
		}

		if (changed) result.updatedActions.push(action)
	}

	return result
}

export const UpgradeScripts = [script0, v300]
