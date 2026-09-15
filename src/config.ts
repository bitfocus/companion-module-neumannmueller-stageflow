import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
import type { StageflowConfig } from './types.js'

export function getConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'static-text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				'This module controls the Stageflow timing app by <a href="https://neumannmueller.com" target="_new">Neumann&M&uuml;ller</a>.',
		},
		{
			type: 'bonjour-device',
			id: 'stageflow',
			label: 'Discovered Stageflow instances',
			width: 12,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Stageflow host - e.g. stageflow.local',
			default: 'stageflow.local',
			regex: Regex.HOSTNAME,
			width: 6,
			isVisibleExpression: '!$(options:stageflow)',
		},
		{
			type: 'number',
			id: 'port',
			label: 'Stageflow port - e.g. 2703',
			default: 2703,
			min: 1,
			max: 65535,
			width: 6,
			isVisibleExpression: '!$(options:stageflow)',
		},
		{
			type: 'static-text',
			id: 'feedbackInfo',
			width: 12,
			label: 'Feedback',
			value:
				'Please send feedback about this module to <a href="mailto:dle-support@neumannmueller.com">dle-support@neumannmueller.com</a>',
		},
	]
}

/**
 * Resolve the effective host/port from the config.
 * A bonjour selection ("address:port") overrides the manual fields.
 */
export function resolveTarget(config: StageflowConfig | undefined): { host: string; port: number } | null {
	if (typeof config?.stageflow === 'string' && config.stageflow.includes(':')) {
		const idx = config.stageflow.lastIndexOf(':')
		const host = config.stageflow.slice(0, idx)
		const port = parseInt(config.stageflow.slice(idx + 1), 10)
		if (host && Number.isFinite(port)) return { host, port }
	}
	const port = typeof config?.port === 'string' ? parseInt(config.port, 10) : config?.port
	if (config?.host && port !== undefined && Number.isFinite(port)) return { host: config.host, port }
	return null
}
