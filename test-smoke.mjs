// Ad-hoc smoke test (not shipped): node test-smoke.mjs
import assert from 'node:assert'
import { TimerEngine } from './dist/timer.js'
import { getActionDefinitions } from './dist/actions.js'
import { getFeedbackDefinitions, FEEDBACK_IDS } from './dist/feedbacks.js'
import { buildVariableDefinitions, buildPresetVariableValues } from './dist/variables.js'
import { buildPresets } from './dist/presets.js'
import { UpgradeScripts } from './dist/upgrades.js'
import { resolveTarget, getConfigFields } from './dist/config.js'

// --- TimerEngine math ---------------------------------------------------
const now = 1_800_000_000_000

// stopped: shows inputTime
let r = TimerEngine.computeCountTime({ active: false, pause: false, inputTime: 300000 }, now)
assert.equal(r.countTime, 300000)

// paused: frozen countTime, no offset applied
r = TimerEngine.computeCountTime({ active: false, pause: true, countTime: 123000, inputTime: 300000 }, now)
assert.equal(r.countTime, 123000)

// running countdown: started 60s ago with 5min input -> ~4min left
let td = { active: true, inputCount: 'down', count: 'down', inputTime: 300000, startTime: now - 60000 }
r = TimerEngine.computeCountTime(td, now)
assert.ok(Math.abs(r.countTime - 240000) < 100, `countdown remaining ${r.countTime}`)
assert.equal(r.effectiveCount, 'down')

// countdown crossed zero -> overtime (server formula: now - start - input + 1000)
td = { active: true, inputCount: 'down', count: 'down', inputTime: 300000, startTime: now - 310000 }
r = TimerEngine.computeCountTime(td, now)
assert.equal(r.effectiveCount, 'up')
assert.ok(Math.abs(r.countTime - 11000) < 100, `overtime ${r.countTime}`)

// overtime with stopAt0 -> stays 0
td = { active: true, inputCount: 'down', count: 'up', inputTime: 300000, startTime: now - 310000, stopAt0: true }
r = TimerEngine.computeCountTime(td, now)
assert.equal(r.countTime, 0)

// count-up: started 42s ago
td = { active: true, inputCount: 'up', count: 'up', inputTime: 0, startTime: now - 42000 }
r = TimerEngine.computeCountTime(td, now)
assert.ok(Math.abs(r.countTime - 42000) < 100)

// derived state
let d = TimerEngine.deriveState({ active: true, inputCount: 'down', warnTime: 60000 }, 30000, 'down')
assert.deepEqual(d, { state: 'running', direction: 'down', timeIsUp: false, warnZone: true })
d = TimerEngine.deriveState({ active: true, inputCount: 'down', warnTime: 60000 }, 5000, 'up')
assert.equal(d.timeIsUp, true)
assert.equal(d.warnZone, false)

// display formatting incl. >24h
assert.equal(TimerEngine.formatDisplay(3_725_000).combined, '1:02:05')
assert.equal(TimerEngine.formatDisplay(90_000_000).combined, '25:00:00')
assert.equal(TimerEngine.formatDisplay(undefined).combined, '0:00:00')

// empty timerData must not throw
r = TimerEngine.computeCountTime({}, now)
assert.equal(r.countTime, 0)

// --- actions / feedbacks / presets consistency --------------------------
const sent = []
const self = {
	label: 'stageflow',
	timerData: { active: false, showText: true },
	stageflowPresets: [{ name: 'Keynote', inputCount: 'down', inputTime: 600000 }],
	derived: { timeIsUp: false, warnZone: false },
	log: () => {},
	sendTimerCmd: (cmd, value) => sent.push({ cmd, value }),
}
const actions = getActionDefinitions(self)
const feedbacks = getFeedbackDefinitions(self)
const { structure, presets } = buildPresets(self)

for (const id of FEEDBACK_IDS) assert.ok(feedbacks[id], `feedback ${id} defined`)

// every preset references defined actions/feedbacks with valid options
for (const [pid, preset] of Object.entries(presets)) {
	assert.equal(preset.type, 'simple', pid)
	for (const step of preset.steps)
		for (const a of step.down) assert.ok(actions[a.actionId], `${pid}: action ${a.actionId}`)
	for (const f of preset.feedbacks) assert.ok(feedbacks[f.feedbackId], `${pid}: feedback ${f.feedbackId}`)
}
// every structure reference resolves
for (const section of structure) for (const ref of section.definitions) assert.ok(presets[ref], `structure ref ${ref}`)
// variable prefix uses the label
assert.ok(presets.timerCombined.style.text === '$(stageflow:combined)')
assert.ok(presets.sfPreset_0.style.text === '$(stageflow:preset_0)')

// toggle semantics: toggle mode sends bare cmd; on/off send boolean
actions.showTimer.callback({ options: { mode: 'toggle' } })
actions.showTimer.callback({ options: { mode: 'on' } })
actions.blackout.callback({ options: { mode: 'toggle' } }) // timerData.blackout undefined -> true
actions.showText.callback({ options: { mode: 'toggle' } }) // timerData.showText true -> false
assert.deepEqual(sent, [
	{ cmd: 'showTimer', value: undefined },
	{ cmd: 'showTimer', value: true },
	{ cmd: 'blackout', value: true },
	{ cmd: 'showText', value: false },
])

// setMinSec sends seconds
sent.length = 0
actions.setMinSec.callback({ options: { time: 2, minSec: 'min', direction: 'plus' } })
assert.deepEqual(sent, [{ cmd: 'plus', value: 120 }])

// customPreset sends ms
sent.length = 0
actions.customPreset.callback({
	options: { time: 5, minSec: 'min', warnTime: 60, direction: 'countDown', directCall: false },
})
assert.deepEqual(
	sent.map((s) => s.cmd),
	['pause', 'countDown', 'warnTime', 'inputTime', 'reset'],
)
assert.equal(sent[2].value, 60000)
assert.equal(sent[3].value, 300000)

// --- variables -----------------------------------------------------------
const defs = buildVariableDefinitions(self.stageflowPresets)
assert.ok(defs.combined && defs.preset_0 && defs.state)
assert.ok(!Array.isArray(defs), 'definitions must be an object')
assert.deepEqual(buildPresetVariableValues(self.stageflowPresets), { preset_0: 'Keynote' })

// --- config --------------------------------------------------------------
assert.equal(getConfigFields().length, 5)
assert.deepEqual(resolveTarget({ host: 'stageflow.local', port: 2703 }), { host: 'stageflow.local', port: 2703 })
assert.deepEqual(resolveTarget({ host: 'x', port: '2703' }), { host: 'x', port: 2703 })
assert.deepEqual(resolveTarget({ stageflow: '10.0.0.5:2703', host: 'x', port: 1 }), { host: '10.0.0.5', port: 2703 })
assert.equal(resolveTarget({}), null)

// --- upgrade scripts -----------------------------------------------------
assert.equal(UpgradeScripts.length, 2)
const props = {
	config: { host: 'stageflow.local', port: '2703' },
	secrets: null,
	actions: [
		{ id: '1', controlId: 'c1', actionId: 'showTimer', options: {} },
		{
			id: '2',
			controlId: 'c2',
			actionId: 'customPreset',
			options: { driectCall: { value: true, isExpression: false } },
		},
		{ id: '3', controlId: 'c3', actionId: 'start', options: {} },
	],
	feedbacks: [],
}
const res = UpgradeScripts[1]({ currentConfig: props.config }, props)
assert.equal(res.updatedConfig.port, 2703)
assert.equal(res.updatedActions.length, 2)
assert.deepEqual(props.actions[0].options.mode, { value: 'toggle', isExpression: false })
assert.deepEqual(props.actions[1].options.directCall, { value: true, isExpression: false })
assert.ok(!('driectCall' in props.actions[1].options))

console.log('All smoke tests passed.')
