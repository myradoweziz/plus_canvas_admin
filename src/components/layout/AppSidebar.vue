<template>
	<aside
		:class="[
			'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
			{
				'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
				'lg:w-[90px]': !isExpanded && !isHovered,
				'translate-x-0 w-[290px]': isMobileOpen,
				'-translate-x-full': !isMobileOpen,
				'lg:translate-x-0': true
			}
		]"
		@mouseenter="!isExpanded && (isHovered = true)"
		@mouseleave="isHovered = false"
	>
		<div :class="['py-8 flex', !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start']">
			<router-link to="/admin-panel">
				<HeaderLogo :class="[isExpanded || isHovered || isMobileOpen ? '' : 'scale-90 origin-left']" />
			</router-link>
		</div>
		<div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
			<nav class="mb-6">
				<div class="flex flex-col gap-4">
					<ul class="flex flex-col gap-4">
						<li v-for="(item, index) in menuGroups[0].items" :key="item.name">
							<button
								v-if="item.subItems"
								@click="toggleSubmenu(0, index)"
								:class="[
									'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									isSubmenuOpen(0, index) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100',
									!isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'
								]"
							>
								<span :class="[isSubmenuOpen(0, index) ? 'text-blue-700' : 'text-gray-500']">
									<component :is="item.icon" />
								</span>
								<span v-if="isExpanded || isHovered || isMobileOpen" class="truncate">{{ item.name }}</span>
								<ChevronDownIcon
									v-if="isExpanded || isHovered || isMobileOpen"
									:class="[
										'ml-auto w-5 h-5 transition-transform duration-200',
										{
											'rotate-180 text-blue-700': isSubmenuOpen(0, index)
										}
									]"
								/>
							</button>
							<router-link
								v-else-if="item.path"
								:to="item.path"
								:class="[
									'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									isActive(item.path) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
								]"
							>
								<span :class="[isActive(item.path) ? 'text-blue-700' : 'text-gray-500']">
									<component :is="item.icon" />
								</span>
								<span v-if="isExpanded || isHovered || isMobileOpen" class="truncate">{{ item.name }}</span>
							</router-link>
							<transition
								@enter="startTransition"
								@after-enter="endTransition"
								@before-leave="startTransition"
								@after-leave="endTransition"
							>
								<div v-show="isSubmenuOpen(0, index) && (isExpanded || isHovered || isMobileOpen)">
									<ul class="mt-2 space-y-1 ml-9">
										<li v-for="subItem in item.subItems" :key="subItem.name">
											<router-link
												:to="subItem.path"
												:class="[
													'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
													isActive(subItem.path)
														? 'bg-blue-50 text-blue-700'
														: 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
												]"
											>
												<span :class="[isActive(subItem.path) ? 'text-blue-700' : 'text-gray-500']">
													<component :is="subItem.icon" />
												</span>
												<span class="truncate">{{ subItem.name }}</span>
												<span class="flex items-center gap-1 ml-auto">
													<span
														v-if="subItem.new"
														:class="[
															'text-[10px] px-2 py-0.5 rounded-full',
															isActive(subItem.path) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
														]"
													>
														new
													</span>
													<span
														v-if="subItem.pro"
														:class="[
															'text-[10px] px-2 py-0.5 rounded-full',
															isActive(subItem.path) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
														]"
													>
														pro
													</span>
												</span>
											</router-link>
										</li>
									</ul>
								</div>
							</transition>
						</li>
					</ul>
				</div>
			</nav>
		</div>
	</aside>
</template>

<script setup>
	import { computed, watch } from 'vue'
	import { useRoute } from 'vue-router'

	import { useSidebar } from '@/composables/useSidebar'
	import {
		BannerIcon,
		BrandsIcon,
		CanvasEffectsIcon,
		CanvasFormatsIcon,
		CanvasFramesIcon,
		CanvasSizesIcon,
		CategoriesIcon,
		ChatIcon,
		ChevronDownIcon,
		ColorsIcon,
		ContactInfoIcon,
		StocksIcon,
		FeaturedCategoriesIcon,
		HomeIcon,
		MainCategoriesIcon,
		PermissionsIcon,
		ProductsIcon,
		RolesIcon,
		SubCategoriesIcon,
		UserCircleIcon,
		UsersIcon
	} from '@/shared/icons'
	import HeaderLogo from './header/HeaderLogo.vue'

	const route = useRoute()

	const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar()

	const menuGroups = [
		{
			items: [
				{ icon: HomeIcon, name: 'Панель', path: '/admin-panel' },
				{ icon: BannerIcon, name: 'Баннеры', path: '/admin-panel/banners' },
				{ icon: ProductsIcon, name: 'Продукты', path: '/admin-panel/products' },
				{
					icon: CategoriesIcon,
					name: 'Категории',
					path: '/admin-panel/categories',
					subItems: [
						{ name: 'Главные категории', path: '/admin-panel/categories/main-categories', icon: MainCategoriesIcon },
						{ name: 'Категории', path: '/admin-panel/categories/featured-categories', icon: FeaturedCategoriesIcon },
						{ name: 'Подкатегории', path: '/admin-panel/categories/sub-categories', icon: SubCategoriesIcon }
					]
				},
				{ icon: StocksIcon, name: 'Акция рекламный баннер', path: '/admin-panel/stocks' },
				{ icon: BrandsIcon, name: 'Теги', path: '/admin-panel/brands' },
				{ icon: ColorsIcon, name: 'Цвета', path: '/admin-panel/colors' },
				{ icon: CanvasSizesIcon, name: 'Размеры холста', path: '/admin-panel/canvas-sizes' },
				{ icon: CanvasFormatsIcon, name: 'Форматы холста', path: '/admin-panel/canvas-formats' },
				{ icon: CanvasFramesIcon, name: 'Рамки', path: '/admin-panel/canvas-frames' },
				{ icon: CanvasEffectsIcon, name: 'Эффекты', path: '/admin-panel/canvas-effects' },
				{ icon: ChatIcon, name: 'FAQ', path: '/admin-panel/faqs' },
				{ icon: ContactInfoIcon, name: 'Контактная информация', path: '/admin-panel/contact-info' },
				{
					icon: UsersIcon,
					name: 'Пользователи',
					path: '/admin-panel/settings/permissions',
					subItems: [
						{ icon: PermissionsIcon, name: 'Права', path: '/admin-panel/settings/permissions' },
						{ icon: RolesIcon, name: 'Роли', path: '/admin-panel/settings/roles' },
						{ icon: UserCircleIcon, name: 'Пользователи', path: '/admin-panel/settings/users' }
					]
				}
			]
		}
	]

	const isActive = (path) => route.path === path

	const activeSubmenuKey = computed(() => {
		for (const [groupIndex, group] of menuGroups.entries()) {
			const itemIndex = group.items.findIndex((item) => item.subItems?.some((subItem) => isActive(subItem.path)))

			if (itemIndex >= 0) {
				return `${groupIndex}-${itemIndex}`
			}
		}

		return null
	})

	watch(
		() => route.path,
		() => {
			openSubmenu.value = activeSubmenuKey.value
		},
		{ immediate: true }
	)

	const toggleSubmenu = (groupIndex, itemIndex) => {
		const key = `${groupIndex}-${itemIndex}`
		openSubmenu.value = openSubmenu.value === key ? null : key
	}

	const isSubmenuOpen = (groupIndex, itemIndex) => {
		const key = `${groupIndex}-${itemIndex}`
		return openSubmenu.value === key || activeSubmenuKey.value === key
	}

	const startTransition = (el) => {
		el.style.height = 'auto'
		const height = el.scrollHeight
		el.style.height = '0px'
		el.offsetHeight // force reflow
		el.style.height = height + 'px'
	}

	const endTransition = (el) => {
		el.style.height = ''
	}
</script>
