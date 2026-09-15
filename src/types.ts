import type { LogLevel } from '@companion-module/base'

/** Connection config as stored by Companion. */
export type StageflowConfig = {
	host?: string
	port?: number | string
	/** Bonjour selection ("address:port"), null when set to Manual */
	stageflow?: string | null
}

/** Timer state broadcast by the Stageflow app. All times in ms, startTime is a host-corrected epoch timestamp. */
export type TimerData = {
	inputTime?: number
	oldInputTime?: number
	inputCount?: 'down' | 'up'
	count?: 'down' | 'up' | null
	countTime?: number
	startTime?: number
	extraTime?: number
	warnTime?: number
	active?: boolean
	pause?: boolean
	stopAt0?: boolean
	showLeadingZerosHours?: boolean
	showLeadingZerosMinutes?: boolean
	showTimer?: boolean
	showDate?: boolean
	showTime?: boolean
	showTimeBar?: boolean
	syncSeconds?: boolean
	showMinus?: boolean
	showInSeconds?: boolean
	timerBlink?: boolean
	backgroundBlink?: boolean
	showText?: boolean
	text?: string
	showFullscreenText?: boolean
	fullscreenText?: string
	flash?: boolean
	blackout?: boolean
	ntpSync?: boolean
}

/** A preset defined in the Stageflow remote. */
export type StageflowPreset = {
	name?: string
	inputCount?: 'down' | 'up'
	inputTime?: number
	warnTime?: number
}

/** State derived locally from timerData (not part of the server contract). */
export type DerivedState = {
	state: 'running' | 'paused' | 'stopped'
	direction: 'down' | 'up'
	timeIsUp: boolean
	warnZone: boolean
}

/** The instance surface the definition builders need. */
export interface StageflowModule {
	readonly label: string
	timerData: TimerData
	stageflowPresets: StageflowPreset[]
	derived: DerivedState
	log(level: LogLevel, message: string): void
	sendTimerCmd(cmd: string, value?: unknown): void
}
