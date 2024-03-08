const { InstanceBase, InstanceStatus, runEntrypoint, combineRgb } = require('@companion-module/base')
const io = require('socket.io-client')

const actions = require('./src/actions')
const feedback = require('./src/feedback')
const presets = require('./src/presets')
const configFields = require('./src/configFields')
const UpgradeScripts = require('./src/upgrades')

var debug
var log

class StageflowInstance extends InstanceBase {
	/**
	 * Create an instance.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config)

		Object.assign(this, { ...configFields, ...actions, ...feedback, ...presets })
		this.feedbackTimerState = {}
		this.stageflowPresets = {}
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}
		debug('destroy', this.id)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init(config) {
		debug = this.debug
		log = this.log
		this.init_appConnection(config)
	}

	/**
	 * Initalize the Stage-App connection.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	init_appConnection(config) {
		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}
		this.config = config
		this.initActions()

		if (this.config?.host && this.config?.port) {
			this.socket = io(`ws://${this.config.host}:${this.config.port}`)

			this.socket.on('connect', () => {
				console.log('socket connected | id:', this.socket.id)
				this.socket.emit('register', 'remote')
				this.updateStatus(InstanceStatus.Ok, 'Connected')
				this.sendCommand('requestData')
			})
			this.socket.on('connect_error', (err) => {
				this.debug('Network error', err)
				this.log('error', 'Network error: ' + err.message)
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Network error')
			})
			this.socket.on('toRemote', (data) => {
				this.setVariables(data)
				this.initFeedbacks()
				this.checkFeedbacks()
			})
		} else {
			this.updateStatus(InstanceStatus.BadConfig, 'Connection not set')
		}

		if (this.socket !== undefined) {
			this.sendCommand = (cmd, data) => {
				this.socket.emit('remoteCMD', { cmd, data })
			}
		}
	}

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = this.getFeedbacks()
		this.setFeedbackDefinitions(feedbacks)
	}

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets(stageflowPresets) {
		var generatedPresets = this.getPresets(stageflowPresets)
		this.setPresetDefinitions(generatedPresets)
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		if (this.config?.host != config?.host) {
			this.config = config
			this.init_appConnection()
		}
	}

	/**
	 * updates feedback data
	 *
	 * @param {Object} data -Feedback data
	 * @access public
	 * @since 1.0.0
	 */
	setVariables(data) {
		if (data.timerData) {
			this.feedbackTimerState = data.timerData
		}
		if (data.remoteData?.presets) {
			this.stageflowPresets = data.remoteData.presets
			let variables = []
			let presetID = 0
			let vairableValues = {}
			data.remoteData.presets.forEach((preset) => {
				const name = data.remoteData.presets[presetID].name
				let variableId = `preset_${presetID}`
				variables.push({ variableId, name })
				vairableValues[variableId] = name
				presetID++
			})
			this.setVariableDefinitions(variables)
			this.setVariableValues(vairableValues)
			this.initPresets(this.stageflowPresets)
		}
	}
}

runEntrypoint(StageflowInstance, UpgradeScripts)
