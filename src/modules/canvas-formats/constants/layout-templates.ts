export const LAYOUT_TEMPLATE_OPTIONS = [
	{ label: 'Стандартный (Auto Grid)', value: '' },
	{ label: 'Квадратная сетка (Square Grid)', value: 'grid-square' },
	{ label: 'Горизонтальная сетка (Landscape Grid)', value: 'grid-landscape' },
	{ label: 'Вертикальная сетка (Portrait Grid)', value: 'grid-portrait' },
	{ label: 'Сердце (Heart)', value: 'heart' },
	{ label: '1 Большой + Мелкие вокруг', value: '1-large-surrounded' },
	{ label: '3-х панельный симметричный (3-split)', value: '3-split' },
	{ label: '2-х панельный вертикальный (2-split-vertical)', value: '2-split-vertical' },
	{ label: 'Panorama 3/1 (широкий горизонтальный)', value: 'panorama-3-1' },
	{ label: '3 parçalı panorama (равные панели)', value: '3-panel-equal' },
	{ label: 'Dikey 1/2 (узкий вертикальный)', value: 'dikey-1-2' },
	{ label: 'Dikey 1/3 (высокий узкий)', value: 'dikey-1-3' },
	{ label: '5 parçalı simetrik (5-split)', value: '5-split' }
] as const

/** Suggested upload_image_count when layout template changes on products. */
export function uploadCountForLayoutTemplate(template: string): number | undefined {
	switch (template) {
		case '2-split-vertical':
			return 2
		case '3-split':
		case '3-panel-equal':
			return 3
		case '5-split':
			return 5
		default:
			return undefined
	}
}
