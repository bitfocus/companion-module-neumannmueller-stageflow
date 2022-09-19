var instance_skel = require('../../instance_skel');
var actions = require('./actions');
var feedback = require('./feedback');
var presets = require('./presets');
const io = require('socket.io-client')

var debug;
var log;

class instance extends instance_skel {
	/**
	* Create an instance.
	*
	* @param {EventEmitter} system - the brains of the operation
	* @param {string} id - the instance ID
	* @param {Object} config - saved user configuration parameters
	* @since 1.0.0
	*/
	constructor(system, id, config) {
		super(system, id, config);

		Object.assign(this, { ...actions, ...feedback, ...presets });
		this.feedbackTimerState = {}
		this.stageflowPresets = {}
		this.actions(); // export actions
	}
	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {
		this.setActions(this.getActions());
	}
	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields() {

		return [
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls Stageflow timing app by <a href="https://neumannmueller.com" target="_new">Neumann&M&uuml;ller</a>.'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Stageflow local domain e.g. stageflow.local',
				default: 'stageflow.local',
				width: 6,
				required: true
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Stageflow port - e.g. 2703',
				default: '2703',
				min: '1',
				max: '65535',
				width: 6,
				required: true
			},
			{
				type: 'text',
				id: 'info',
				width: 6,
				label: 'Feedback',
				value: 'Please send feedback to this module to dle-support@neumannmueller.com'
			}
		]
	}
	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		var id = action.action,
			opt = action.options,
			task,
			cmd,
			data,
			time,
			value;

		switch (id) {

			case 'start':
				task = 'updateTimer';
				cmd = this.feedbackTimerState.active ? 'pause' : 'start'
				data = { cmd }
				break;

			case 'reset':
				task = 'updateTimer';
				cmd = 'reset'
				data = { cmd }
				break;

			case 'setMinSec':
				task = 'updateTimer';
				time = opt.minSec == 'sec' || opt.time == 0 ? opt.time : opt.time * 60
				data = { cmd: opt.direction, value: time }
				break;

			case 'setMessage':
				task = 'updateTimer';
				cmd = 'text'
				value = opt.message
				data = { cmd, value }
				break;

			case 'preset':
				task = 'updateTimer';
				cmd = 'preset'
				value = {
					presetID: parseInt(opt.presetID),
					directCall: opt.directCall
				}
				data = { cmd, value }
				break;

			case 'timerBlink':
				task = 'updateTimer';
				data = { cmd: 'timerBlink', value: this.feedbackTimerState.timerBlink ? false : true }
				break;
			case 'showText':
				task = 'updateTimer';
				data = { cmd: 'showText', value: this.feedbackTimerState.showText ? false : true }
				break;
			case 'showTimer':
				task = 'updateTimer';
				data = { cmd: 'showTimer', value: this.feedbackTimerState.showTimer ? false : true }
				break;
			case 'showTime':
				task = 'updateTimer';
				data = { cmd: 'showTime', value: this.feedbackTimerState.showTime ? false : true }
				break;
			case 'showDate':
				task = 'updateTimer';
				data = { cmd: 'showDate', value: this.feedbackTimerState.showDate ? false : true }
				break;
			case 'blackout':
				task = 'updateTimer';
				data = { cmd: 'blackout', value: this.feedbackTimerState.blackout ? false : true }
				break;
			case 'flash':
				task = 'updateTimer';
				data = { cmd: 'flash', value: this.feedbackTimerState.flash ? false : true }
				break;


		}

		if (task !== undefined) {
			debug('sending ', task, "to", this.config.host);
			if (this.currentStatus != this.STATUS_OK) {
				this.init_appConnection(function () {
					this.sendCommand(task, data);
				});
			} else {
				this.sendCommand(task, data);
			}
		}
	}


	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		debug = this.debug;
		log = this.log;
		this.init_appConnection();
	}

	/**
	 * Initalize the Stage-App connection.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	init_appConnection() {
		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		if (this.config.host && this.config.port) {
			this.socket = io(`ws://${this.config.host}:${this.config.port}`)

			this.socket.on('connect', () => {
				console.log('socket connected - id:', this.socket.id)
				this.socket.emit('register', 'remote')
				this.status(0, 'Connected');
				this.sendCommand("requestData")
			});
			this.socket.on('connect_error', (err) => {
				this.debug("Network error", err);
				this.log('error', "Network error: " + err.message);
				this.status(2, 'Network error');
			});
			this.socket.on('toRemote', data => {
				this.setVariables(data)
				this.initFeedbacks()
				this.initPresets()
				this.checkFeedbacks()
			})
		}

		this.sendCommand = (cmd, data) => {
			this.socket.emit('remoteCMD', { cmd, data })
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
		var feedbacks = this.getFeedbacks();
		this.setFeedbackDefinitions(feedbacks);
	}

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets(updates) {
		this.setPresetDefinitions(this.getPresets(updates));
	}




	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		var resetConnection = false;

		if (this.config.host != config.host) {
			resetConnection = true;
		}

		this.config = config;
		this.initPresets();

		if (resetConnection === true || this.socket === undefined) {
			this.init_appConnection();
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
			// console.log(data.timerData)
			this.feedbackTimerState = data.timerData
		}
		if (data.remoteData) {
			this.stageflowPresets = data.remoteData.presets
			let presetID = 0
			data.remoteData.presets.forEach(preset => {
				// console.log(presetID);
				const name = data.remoteData.presets[presetID].name;
				this.setVariable(`preset_${presetID}`, name)
				presetID++
			})
			this.initPresets();
		}
	}
}

exports = module.exports = instance;
