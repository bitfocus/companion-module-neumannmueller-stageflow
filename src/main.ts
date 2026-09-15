import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { io, type Socket } from 'socket.io-client'

import { getConfigFields, resolveTarget } from './config.js'
import { getActionDefinitions } from './actions.js'
import { getFeedbackDefinitions, FEEDBACK_IDS } from './feedbacks.js'
import { buildVariableDefinitions, buildPresetVariableValues } from './variables.js'
import { buildPresets } from './presets.js'
import { TimerEngine } from './timer.js'
import { UpgradeScripts } from './upgrades.js'
import type { DerivedState, StageflowConfig, StageflowModule, StageflowPreset, TimerData } from './types.js'

class StageflowInstance extends InstanceBase implements StageflowModule {
	config: StageflowConfig = {}
	socket: Socket | undefined = undefined
	timerData: TimerData = {}
	stageflowPresets: StageflowPreset[] = []
	derived: DerivedState = { state: 'stopped', direction: 'down', timeIsUp: false, warnZone: false }
	/** host clock minus local clock, in ms - per instance, seeded from toStage timeSync */
	timeDiff = 0
	timerEngine: TimerEngine | null = null

	async init(config: StageflowConfig): Promise<void> {
		this.config = config

		this.setActionDefinitions(getActionDefinitions(this))
		this.setFeedbackDefinitions(getFeedbackDefinitions(this))
		this.refreshDefinitions()

		this.timerEngine = new TimerEngine({
			getTimerData: () => this.timerData,
			getTimeDiff: () => this.timeDiff,
			onDisplay: (values) => this.setVariableValues(values),
			onDerivedChange: (derived) => {
				this.derived = derived
				this.checkFeedbacks('timerActive', 'timeIsUp', 'warnZone')
			},
		})
		this.timerEngine.start()

		this.initSocket()
	}

	async destroy(): Promise<void> {
		this.timerEngine?.stop()
		this.teardownSocket()
	}

	async configUpdated(config: StageflowConfig): Promise<void> {
		const oldTarget = resolveTarget(this.config)
		const newTarget = resolveTarget(config)
		const reconnect = !this.socket || oldTarget?.host !== newTarget?.host || oldTarget?.port !== newTarget?.port

		this.config = config
		// the instance label may have changed - preset texts embed it
		this.refreshDefinitions()
		if (reconnect) this.initSocket()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return getConfigFields()
	}

	/** (Re-)register variable definitions and presets. */
	refreshDefinitions(): void {
		this.setVariableDefinitions(buildVariableDefinitions(this.stageflowPresets))
		this.setVariableValues(buildPresetVariableValues(this.stageflowPresets))
		const { structure, presets } = buildPresets(this)
		this.setPresetDefinitions(structure, presets)
	}

	initSocket(): void {
		this.teardownSocket()

		const target = resolveTarget(this.config)
		if (!target) {
			this.updateStatus(InstanceStatus.BadConfig, 'Host/port not set')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		const socket = io(`ws://${target.host}:${target.port}`, { reconnection: true })
		this.socket = socket

		socket.on('connect', () => {
			this.log('info', `Connected to Stageflow at ${target.host}:${target.port}`)
			// 'remote' receives timer/preset broadcasts, 'stage' receives timeSync
			socket.emit('register', 'remote')
			socket.emit('register', 'stage')
			socket.emit('remoteCMD', { cmd: 'requestData' })
			// only a stage requestData answers immediately with timeSync
			socket.emit('stageCMD', { cmd: 'requestData' })
			this.updateStatus(InstanceStatus.Ok)
		})
		socket.on('connect_error', (err: Error) => {
			this.log('error', `Network error: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		})
		socket.on('disconnect', () => {
			this.updateStatus(InstanceStatus.Disconnected)
		})
		socket.on('toRemote', (data: { timerData?: TimerData; remoteData?: { presets?: StageflowPreset[] } }) =>
			this.onServerData(data),
		)
		socket.on('toStage', (data: { timeSync?: number }) => {
			if (typeof data?.timeSync === 'number') {
				this.timeDiff = data.timeSync - Date.now()
			}
		})
		socket.on('timePing', () => {
			socket.emit('timePong')
		})
	}

	teardownSocket(): void {
		if (this.socket) {
			this.socket.removeAllListeners()
			this.socket.disconnect()
			this.socket = undefined
		}
	}

	/** Emit a remoteCMD to the app. */
	sendCommand(cmd: string, data?: unknown): void {
		if (!this.socket?.connected) {
			this.log('warn', `Not connected - dropping command '${cmd}'`)
			return
		}
		this.socket.emit('remoteCMD', data !== undefined ? { cmd, data } : { cmd })
	}

	/** Emit an updateTimer sub-command. */
	sendTimerCmd(cmd: string, value?: unknown): void {
		this.sendCommand('updateTimer', value !== undefined ? { cmd, value } : { cmd })
	}

	/** Handle a toRemote payload (timerData and/or remoteData). */
	onServerData(data: { timerData?: TimerData; remoteData?: { presets?: StageflowPreset[] } }): void {
		if (data?.timerData) {
			this.timerData = data.timerData
			this.setVariableValues({
				preparedMessage: this.timerData.text ?? '',
				preparedFullscreenMessage: this.timerData.fullscreenText ?? '',
				warnTime: Math.round((this.timerData.warnTime ?? 0) / 1000),
			})
			// force-refresh display + derived state, then re-evaluate everything
			this.timerEngine?.tick(true)
			this.checkFeedbacks(...FEEDBACK_IDS)
		}

		if (Array.isArray(data?.remoteData?.presets)) {
			const presets = data.remoteData.presets
			if (JSON.stringify(presets) !== JSON.stringify(this.stageflowPresets)) {
				this.stageflowPresets = presets
				this.refreshDefinitions()
			}
		}
	}
}

export default StageflowInstance
export { UpgradeScripts }
