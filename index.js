const { InstanceBase, InstanceStatus, runEntrypoint, combineRgb } = require('@companion-module/base')
const io = require('socket.io-client')

const actions = require('./src/actions')
const feedback = require('./src/feedback')
const presets = require('./src/presets')
const configFields = require('./src/configFields')
const UpgradeScripts = require('./src/upgrades')

let debug
let log

var timeDiff = 0 // time difference between host and localTime in ms

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
		this.timeToDisplay = {
			currentTime: 0,
			countTime: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			combined: '0:00:00',
		}
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
				this.socket.emit('register', 'stage')
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
			this.socket.on('toStage', (data) => {
				if (data.timeSync) {
					timeDiff = new Date(data.timeSync) - new Date()
					console.info('Time difference to host: ' + timeDiff + ' ms')
				}
			})
			this.socket.on('disconnect', () => {
				this.debug('socket disconnected')
				this.updateStatus(InstanceStatus.Disconnected, 'Disconnected')
			})
		} else {
			this.updateStatus(InstanceStatus.BadConfig, 'Connection not set')
		}

		if (this.socket !== undefined) {
			this.sendCommand = (cmd, data) => {
				this.socket.emit('remoteCMD', { cmd, data })
			}
		}
		this.timer()
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
			this.setVariableValues({ preparedMessage: this.feedbackTimerState.text })
		}
		if (data.remoteData?.presets) {
			this.stageflowPresets = data.remoteData.presets
			let variables = []
			let presetID = 0
			let vairableValues = {}

			for (let i = 0; i < data.remoteData.presets.length; i++) {
				const preset = data.remoteData.presets[i]
				let variableId = `preset_${i}`
				variables.push({ variableId, name: preset.name })
				vairableValues[variableId] = preset.name
			}

			let displayVariables = [
				{ variableId: 'currentTime', name: 'Current Time' },
				{ variableId: 'combined', name: 'Combined Time' },
				{ variableId: 'hours', name: 'Hours' },
				{ variableId: 'minutes', name: 'Minutes' },
				{ variableId: 'seconds', name: 'Seconds' },
				{ variableId: 'preparedMessage', name: 'Prepared Message' },
			]
			variables = variables.concat(displayVariables)

			let defaultDisplayValues = {
				currentTime: new Date().getTime() + timeDiff,
				combined: '0:00:00',
				hours: 0,
				minutes: 0,
				seconds: 0,
				preparedMessage: 'Prepared Message',
			}

			vairableValues = Object.assign(vairableValues, defaultDisplayValues)
			this.setVariableDefinitions(variables)
			this.setVariableValues(vairableValues)
			this.initPresets(this.stageflowPresets)
		}
	}

	timer() {
		setTimeout(() => {
			this.timer()
		}, 100)

		if (this.feedbackTimerState.active) {
			this.timeToDisplay.currentTime = new Date().getTime() + timeDiff

			if (
				this.feedbackTimerState.inputCount === 'up' ||
				this.feedbackTimerState.count === 'up' ||
				this.feedbackTimerState.inputTime < 0
			) {
				this.countUp()
			} else {
				this.countDown()
			}

			this.checkTimerDirection()
		} else if (this.feedbackTimerState.pause) {
			this.timeToDisplay.countTime = this.feedbackTimerState.countTime + timeDiff

			this.handleDisplayTime()
		} else {
			this.timeToDisplay.countTime = this.feedbackTimerState.inputTime
			this.handleDisplayTime()
		}
	}

	checkTimerDirection() {
		let currentTimeIsUpState = this.feedbackTimerState.timeIsUp

		if (this.feedbackTimerState.inputCount != this.feedbackTimerState.count) {
			this.feedbackTimerState.timeIsUp = true
		} else {
			this.feedbackTimerState.timeIsUp = false
		}

		if (currentTimeIsUpState != this.feedbackTimerState.timeIsUp) this.checkFeedbacks()
	}
	handleDisplayTime() {
		let date = new Date(this.timeToDisplay.countTime)

		this.timeToDisplay.hours = date.getUTCHours()
		this.timeToDisplay.minutes = date.getUTCMinutes()
		this.timeToDisplay.seconds = date.getUTCSeconds()

		// if less than 10, add a leading zero
		if (this.timeToDisplay.minutes < 10) {
			this.timeToDisplay.minutes = '0' + this.timeToDisplay.minutes
		}
		if (this.timeToDisplay.seconds < 10) {
			this.timeToDisplay.seconds = '0' + this.timeToDisplay.seconds
		}
		// 		this.timeToDisplay.combined = `${this.timeToDisplay.hours}:${this
		this.timeToDisplay.combined = `${this.timeToDisplay.hours}:${this.timeToDisplay.minutes}:${this.timeToDisplay.seconds}`

		this.setVariableValues(this.timeToDisplay)
	}
	countDown() {
		this.timeToDisplay.countTime =
			(this.timeToDisplay.currentTime - this.feedbackTimerState.inputTime - this.feedbackTimerState.startTime + 16) * -1
		if (this.timeToDisplay.countTime < 1000) {
			this.feedbackTimerState.count = 'up'
			this.countUp()
		} else {
			this.handleDisplayTime()
		}
	}
	countUp() {
		if (this.feedbackTimerState.inputCount === this.feedbackTimerState.count) {
			this.timeToDisplay.countTime = this.timeToDisplay.currentTime - this.feedbackTimerState.startTime
		} else {
			if (this.feedbackTimerState.stopAt0) {
				this.timeToDisplay.countTime = 0
			} else {
				this.timeToDisplay.countTime =
					this.timeToDisplay.currentTime - this.feedbackTimerState.inputTime - this.feedbackTimerState.startTime + 16
				if (this.feedbackTimerState.timeIsUp) this.timeToDisplay.countTime += 1000
			}
		}

		if (this.timeToDisplay.countTime < 1000) this.timeToDisplay.countTime = 0
		this.handleDisplayTime()
	}
}

runEntrypoint(StageflowInstance, UpgradeScripts)
