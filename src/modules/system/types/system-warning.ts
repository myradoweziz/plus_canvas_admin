export type SystemWarningType = 'info' | 'warning' | 'error'

export type SystemWarning = {
	type: SystemWarningType
	title: string
	message: string
	count: number
}

export type SystemWarningsResponse = {
	warnings: SystemWarning[]
	total_count: number
}
