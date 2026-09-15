import type { CompanionVariableDefinitions, CompanionVariableValues } from '@companion-module/base'
import type { StageflowPreset } from './types.js'

/**
 * Variable definitions. setVariableDefinitions (base v2) takes an object
 * keyed by variableId.
 */
export function buildVariableDefinitions(stageflowPresets: StageflowPreset[]): CompanionVariableDefinitions {
	const definitions: CompanionVariableDefinitions = {
		currentTime: { name: 'Current Time (host-corrected epoch ms)' },
		combined: { name: 'Combined Time (H:MM:SS)' },
		hours: { name: 'Hours' },
		minutes: { name: 'Minutes' },
		seconds: { name: 'Seconds' },
		preparedMessage: { name: 'Prepared message' },
		preparedFullscreenMessage: { name: 'Prepared fullscreen message' },
		state: { name: 'Timer state (running/paused/stopped)' },
		direction: { name: 'Count direction (up/down)' },
		timeIsUp: { name: 'Time is up (true/false)' },
		warnTime: { name: 'Warn time (seconds)' },
	}
	for (let i = 0; i < (stageflowPresets?.length ?? 0); i++) {
		definitions[`preset_${i}`] = { name: stageflowPresets[i]?.name || `Preset ${i}` }
	}
	return definitions
}

/** Values for the dynamic preset_N variables. */
export function buildPresetVariableValues(stageflowPresets: StageflowPreset[]): CompanionVariableValues {
	const values: CompanionVariableValues = {}
	for (let i = 0; i < (stageflowPresets?.length ?? 0); i++) {
		values[`preset_${i}`] = stageflowPresets[i]?.name ?? ''
	}
	return values
}
