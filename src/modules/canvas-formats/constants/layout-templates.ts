export const LAYOUT_TEMPLATE_OPTIONS = [
	{ label: 'Стандартный (Auto Grid)', value: '' },
	{ label: 'Квадратная сетка (Square Grid)', value: 'grid-square' },
	{ label: 'Горизонтальная сетка (Landscape Grid)', value: 'grid-landscape' },
	{ label: 'Вертикальная сетка (Portrait Grid)', value: 'grid-portrait' },
	{ label: 'Сердце (Heart)', value: 'heart' },
	{ label: '1 Большой + Мелкие вокруг', value: '1-large-surrounded' },
	{ label: '3-х панельный симметричный (3-split)', value: '3-split' },
	{ label: '2 parçalı dikey (2 квадрата вертикально)', value: '2-split-vertical' },
	{ label: '2 parçalı yatay (2 квадрата горизонтально)', value: '2-square-horizontal' },
	{ label: 'Panorama 3/1 (широкий горизонтальный)', value: 'panorama-3-1' },
	{ label: 'Yatay 2/1 (горизонтальный 2:1)', value: 'yatay-2-1' },
	{ label: '3 parçalı panorama (равные панели)', value: '3-panel-equal' },
	{ label: '3 parçalı yatay (3 квадрата в ряд)', value: '3-square-horizontal' },
	{ label: '3 parçalı dikey (3 квадрата в столбец)', value: '3-square-vertical' },
	{ label: 'Dikey 1/2 (узкий вертикальный)', value: 'dikey-1-2' },
	{ label: 'Dikey 1/3 (высокий узкий)', value: 'dikey-1-3' },
	{ label: '5 parçalı simetrik (5-split)', value: '5-split' },
	{ label: '4 parçalı kare (сетка 2×2)', value: '4-square-grid' }
] as const

/** Suggested upload_image_count when layout template changes on products. */
export function uploadCountForLayoutTemplate(template: string): number | undefined {
	switch (template) {
		case '2-split-vertical':
		case '2-square-horizontal':
			return 2
		case '3-split':
		case '3-panel-equal':
		case '3-square-horizontal':
		case '3-square-vertical':
			return 3
		case '4-square-grid':
			return 4
		case '5-split':
			return 5
		default:
			return undefined
	}
}
