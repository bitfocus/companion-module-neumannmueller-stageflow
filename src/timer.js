/**
 * Local timer simulation.
 *
 * The Stageflow app broadcasts timerData only on state changes - there is no
 * per-second tick from the server. This engine mirrors the server's own
 * countDown()/countUp() math (App/src/main/index.ts) so the displayed time
 * stays in sync with the stage output, using the host clock offset (timeDiff).
 */
export class TimerEngine {
	constructor({ getTimerData, getTimeDiff, onDisplay, onDerivedChange }) {
		this.getTimerData = getTimerData
		this.getTimeDiff = getTimeDiff
		this.onDisplay = onDisplay
		this.onDerivedChange = onDerivedChange
		this.interval = null
		this.lastCombined = null
		this.lastDerivedKey = null
	}

	start() {
		if (!this.interval) this.interval = setInterval(() => this.tick(), 100)
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval)
			this.interval = null
		}
	}

	/** Recompute display + derived state; emit only on change (or when forced). */
	tick(force = false) {
		const td = this.getTimerData() || {}
		const now = Date.now() + this.getTimeDiff()
		const { countTime, effectiveCount } = TimerEngine.computeCountTime(td, now)
		const derived = TimerEngine.deriveState(td, countTime, effectiveCount)
		const display = TimerEngine.formatDisplay(countTime)

		if (force || display.combined !== this.lastCombined) {
			this.lastCombined = display.combined
			this.onDisplay({
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
			this.onDerivedChange(derived)
		}
	}

	/**
	 * Mirrors the server's timer()/countDown()/countUp().
	 * Never mutates td - the direction flip into overtime is derived locally.
	 * All values in ms; `now` must already be host-corrected.
	 */
	static computeCountTime(td, now) {
		if (!td.active) {
			// paused: countTime is a frozen duration - no clock offset applies
			const countTime = td.pause ? td.countTime : td.inputTime
			return { countTime: Number.isFinite(countTime) ? countTime : 0, effectiveCount: td.count ?? td.inputCount }
		}

		if (td.inputCount === 'down' && td.count === 'down' && td.inputTime > 0) {
			// server: (now - inputTime - (startTime + 16)) * -1
			const remaining = (now - td.inputTime - (td.startTime + 16)) * -1
			if (remaining >= 1000) {
				return { countTime: remaining, effectiveCount: 'down' }
			}
			// crossed zero: server flips count to 'up' and switches to the overtime formula
			return { countTime: TimerEngine.countUpValue(td, now, 'up'), effectiveCount: 'up' }
		}

		return { countTime: TimerEngine.countUpValue(td, now, td.count), effectiveCount: td.count }
	}

	/** Server countUp(): normal up-count or overtime after a countdown. */
	static countUpValue(td, now, effectiveCount) {
		let countTime
		if (td.inputCount === effectiveCount) {
			countTime = now - td.startTime
		} else if (td.stopAt0) {
			countTime = 0
		} else {
			countTime = now - td.startTime - td.inputTime + 1000
		}
		if (!Number.isFinite(countTime) || countTime < 0) countTime = 0
		return countTime
	}

	static deriveState(td, countTime, effectiveCount) {
		const state = td.active ? 'running' : td.pause ? 'paused' : 'stopped'
		const timeIsUp = td.inputCount !== undefined && td.inputCount !== effectiveCount
		const warnZone =
			!!td.active && effectiveCount === 'down' && td.warnTime > 0 && countTime <= td.warnTime && !timeIsUp
		return { state, direction: effectiveCount ?? 'down', timeIsUp, warnZone }
	}

	static formatDisplay(countTimeMs) {
		const totalSeconds = Math.floor((Number.isFinite(countTimeMs) ? countTimeMs : 0) / 1000)
		const hours = Math.floor(totalSeconds / 3600)
		const minutes = Math.floor((totalSeconds % 3600) / 60)
		const seconds = totalSeconds % 60
		const pad = (n) => String(n).padStart(2, '0')
		return {
			hours,
			minutes: pad(minutes),
			seconds: pad(seconds),
			combined: `${hours}:${pad(minutes)}:${pad(seconds)}`,
		}
	}
}
