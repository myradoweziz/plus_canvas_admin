export const Layouts = {
	default: 'default',
	empty: 'empty',
	admin: 'admin'
} as const

export type LayoutsEnum = (typeof Layouts)[keyof typeof Layouts]

export const LayoutToFileMap: Record<LayoutsEnum, string> = {
	default: 'Default.vue',
	empty: 'Empty.vue',
	admin: 'Admin.vue'
}
