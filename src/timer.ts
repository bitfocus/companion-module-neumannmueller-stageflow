import type { CompanionVariableValues } from '@companion-module/base'
import type { DerivedState, TimerData } from './types.js'

export interface TimerEngineOptions {
	getTimerData: () => TimerData
	getTimeDiff: () => number
	onDisplay: (values: CompanionVariableValues) => void
	onDerivedChange: (derived: DerivedState) => void
}

export interface CountResult {
	countTime: number
	effectiveCount: 'down' | 'up'
}

/**
 * Local timer simulation.
 *
 * The Stageflow app broadcasts timerData only on state changes - there is no
 * per-second tick from the server. This engine mirrors the server's own
 * countDown()/countUp() math (App/src/main/index.ts) so the displayed time
 * stays in sync with the stage output, using the host clock offset (timeDiff).
 */
export class TimerEngine {
	private readonly options: TimerEngineOptions
	private interval: ReturnType<typeof setInterval> | null = null
	private lastCombined: string | null = null
	private lastDerivedKey: string | null = null

	constructor(options: TimerEngineOptions) {
		this.options = options
	}

	start(): void {
		if (!this.interval) this.interval = setInterval(() => this.tick(), 100)
	}

	stop(): void {
		if (this.interval) {
			clearInterval(this.interval)
			this.interval = null
		}
	}

	/** Recompute display + derived state; emit only on change (or when forced). */
	tick(force = false): void {
		const td = this.options.getTimerData() ?? {}
		const now = Date.now() + this.options.getTimeDiff()
		const { countTime, effectiveCount } = TimerEngine.computeCountTime(td, now)
		const derived = TimerEngine.deriveState(td, countTime, effectiveCount)
		const display = TimerEngine.formatDisplay(countTime)

		if (force || display.combined !== this.lastCombined) {
			this.lastCombined = display.combined
			this.options.onDisplay({
				currentTime: now,
				...display,
				state: derived.state,
				direction: derived.direction,
				timeIsUp: derived.timeIsUp,
			})
		}

		const derivedKey = `${derived.state}|${derived.direction}|${derived.timeIsUp}|${derived.warnZone}`
		if (force || derivedKey !== this.lastDerivedKey) {
			this.lastDerivedKey = derivedKey
			this.options.onDerivedChange(derived)
		}
	}

	/**
	 * Mirrors the server's timer()/countDown()/countUp().
	 * Never mutates td - the direction flip into overtime is derived locally.
	 * All values in ms; `now` must already be host-corrected.
	 */
	static computeCountTime(td: TimerData, now: number): CountResult {
		const fallbackCount = td.count ?? td.inputCount ?? 'down'

		if (!td.active) {
			// paused: countTime is a frozen duration - no clock offset applies
			const countTime = td.pause ? td.countTime : td.inputTime
			return { countTime: Number.isFinite(countTime) ? (countTime as number) : 0, effectiveCount: fallbackCount }
		}

		if (td.inputCount === 'down' && td.count === 'down' && (td.inputTime ?? 0) > 0) {
			// server: (now - inputTime - (startTime + 16)) * -1
			const remaining = (now - (td.inputTime ?? 0) - ((td.startTime ?? 0) + 16)) * -1
			if (remaining >= 1000) {
				return { countTime: remaining, effectiveCount: 'down' }
			}
			// crossed zero: server flips count to 'up' and switches to the overtime formula
			return { countTime: TimerEngine.countUpValue(td, now, 'up'), effectiveCount: 'up' }
		}

		return { countTime: TimerEngine.countUpValue(td, now, fallbackCount), effectiveCount: fallbackCount }
	}

	/** Server countUp(): normal up-count or overtime after a countdown. */
	static countUpValue(td: TimerData, now: number, effectiveCount: 'down' | 'up'): number {
		let countTime: number
		if (td.inputCount === effectiveCount) {
			countTime = now - (td.startTime ?? 0)
		} else if (td.stopAt0) {
			countTime = 0
		} else {
			countTime = now - (td.startTime ?? 0) - (td.inputTime ?? 0) + 1000
		}
		if (!Number.isFinite(countTime) || countTime < 0) countTime = 0
		return countTime
	}

	static deriveState(td: TimerData, countTime: number, effectiveCount: 'down' | 'up'): DerivedState {
		const state = td.active ? 'running' : td.pause ? 'paused' : 'stopped'
		const timeIsUp = td.inputCount !== undefined && td.inputCount !== effectiveCount
		const warnZone =
			!!td.active && effectiveCount === 'down' && (td.warnTime ?? 0) > 0 && countTime <= (td.warnTime ?? 0) && !timeIsUp
		return { state, direction: effectiveCount, timeIsUp, warnZone }
	}

	static formatDisplay(countTimeMs: number | undefined): {
		hours: number
		minutes: string
		seconds: string
		combined: string
	} {
		const totalSeconds = Math.floor((Number.isFinite(countTimeMs) ? (countTimeMs as number) : 0) / 1000)
		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60
		const pad = (n: number): string => String(n).padStart(2, '0')
		return {
			hours,
			minutes: pad(minutes),
			seconds: pad(seconds),
			combined: `${hours}:${pad(minutes)}:${pad(seconds)}`,
		}
	}
}
