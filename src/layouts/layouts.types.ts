export enum LayoutsEnum {
	default = 'default',
	empty = 'empty'
}

export const LayoutToFileMap: Record<LayoutsEnum, string> = {
	default: 'Default.vue',
	empty: 'Empty.vue'
}
