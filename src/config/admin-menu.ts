import type { Component } from 'vue'

import { canAccessPermission } from '@/shared/auth/user-access'
import * as icons from '@/shared/icons'
import { ADMIN_PERMISSIONS } from './admin-permissions'

export type AdminMenuItem = {
	icon: Component
	name: string
	path?: string
	permission?: string | string[]
	subItems?: AdminMenuItem[]
	new?: boolean
	pro?: boolean
}

export type AdminMenuGroup = {
	items: AdminMenuItem[]
}

export const adminMenuGroups: AdminMenuGroup[] = [
	{
		items: [
			{
				icon: icons.BannerIcon,
				name: 'Баннеры',
				path: '/admin-panel/banners',
				permission: ADMIN_PERMISSIONS.banners
			},
			{
				icon: icons.ProductsIcon,
				name: 'Продукты',
				path: '/admin-panel/products',
				permission: ADMIN_PERMISSIONS.canvasProducts
			},
			{
				icon: icons.PieChartIcon,
				name: 'Продажи',
				path: '/admin-panel/orders',
				subItems: [
					{
						icon: icons.OrdersIcon,
						name: 'Заказы',
						path: '/admin-panel/orders',
						permission: ADMIN_PERMISSIONS.orders
					},
					{
						icon: icons.ShoppingCartIcon,
						name: 'Корзины',
						path: '/admin-panel/carts',
						permission: ADMIN_PERMISSIONS.carts
					},
					{
						icon: icons.WishlistIcon,
						name: 'Список желаний',
						path: '/admin-panel/wishlists',
						permission: ADMIN_PERMISSIONS.wishlists
					},
					{
						icon: icons.BestsellersIcon,
						name: 'Бестселлеры',
						path: '/admin-panel/bestsellers',
						permission: ADMIN_PERMISSIONS.bestsellers
					},
					{
						icon: icons.NeverPurchasedIcon,
						name: 'Никогда не покупали',
						path: '/admin-panel/never-purchased',
						permission: ADMIN_PERMISSIONS.neverPurchased
					},
					{
						icon: icons.CountryReportIcon,
						name: 'Отчёт по странам',
						path: '/admin-panel/country-report',
						permission: ADMIN_PERMISSIONS.countryReport
					}
				]
			},
			{
				icon: icons.CategoriesIcon,
				name: 'Категории',
				path: '/admin-panel/categories',
				subItems: [
					{
						name: 'Главные категории',
						path: '/admin-panel/categories/main-categories',
						icon: icons.MainCategoriesIcon,
						permission: ADMIN_PERMISSIONS.mainCategories
					},
					{
						name: 'Категории',
						path: '/admin-panel/categories/featured-categories',
						icon: icons.FeaturedCategoriesIcon,
						permission: ADMIN_PERMISSIONS.categories
					},
					{
						name: 'Подкатегории',
						path: '/admin-panel/categories/sub-categories',
						icon: icons.SubCategoriesIcon,
						permission: ADMIN_PERMISSIONS.subCategories
					}
				]
			},
			{
				icon: icons.StocksIcon,
				name: 'Акция рекламный баннер',
				path: '/admin-panel/stocks',
				permission: ADMIN_PERMISSIONS.stocks
			},
			{
				icon: icons.BrandsIcon,
				name: 'Теги товаров',
				path: '/admin-panel/product-tags',
				permission: ADMIN_PERMISSIONS.productTags
			},
			{ icon: icons.ColorsIcon, name: 'Цвета', path: '/admin-panel/colors', permission: ADMIN_PERMISSIONS.colors },
			{
				icon: icons.CanvasSizesIcon,
				name: 'Размеры холста',
				path: '/admin-panel/canvas-sizes',
				permission: ADMIN_PERMISSIONS.canvasSizes
			},
			{
				icon: icons.CanvasFormatsIcon,
				name: 'Форматы холста',
				path: '/admin-panel/canvas-formats',
				permission: ADMIN_PERMISSIONS.canvasFormats
			},
			{
				icon: icons.CanvasFramesIcon,
				name: 'Рамки',
				path: '/admin-panel/canvas-frames',
				permission: ADMIN_PERMISSIONS.canvasFrames
			},
			{
				icon: icons.CanvasEffectsIcon,
				name: 'Эффекты',
				path: '/admin-panel/canvas-effects',
				permission: ADMIN_PERMISSIONS.canvasEffects
			},
			{ icon: icons.ChatIcon, name: 'FAQ', path: '/admin-panel/faqs', permission: ADMIN_PERMISSIONS.faqs },
			{
				icon: icons.ContactInfoIcon,
				name: 'Контактная информация',
				path: '/admin-panel/contact-info',
				permission: ADMIN_PERMISSIONS.contactInfo
			},
			{
				icon: icons.UsersIcon,
				name: 'Пользователи',
				path: '/admin-panel/settings/permissions',
				subItems: [
					// {
					// 	icon: icons.PermissionsIcon,
					// 	name: 'Права',
					// 	path: '/admin-panel/settings/permissions',
					// 	permission: ADMIN_PERMISSIONS.permissions
					// },
					{
						icon: icons.RolesIcon,
						name: 'Роли',
						path: '/admin-panel/settings/roles',
						permission: ADMIN_PERMISSIONS.roles
					},
					{
						icon: icons.UserCircleIcon,
						name: 'Пользователи',
						path: '/admin-panel/settings/users',
						permission: ADMIN_PERMISSIONS.users
					},
					{
						icon: icons.UserActivityIcon,
						name: 'Отчёт по пользователям',
						path: '/admin-panel/settings/users-report',
						permission: ADMIN_PERMISSIONS.customerReport
					},
					// {
					// 	icon: icons.TableIcon,
					// 	name: 'Отчёт по кол-ву заказов',
					// 	path: '/admin-panel/settings/users-report-by-count',
					// 	permission: ADMIN_PERMISSIONS.customerReportByCount
					// },
					{
						icon: icons.ListIcon,
						name: 'Зарегистрированные клиенты',
						path: '/admin-panel/settings/registered-customers',
						permission: ADMIN_PERMISSIONS.registeredCustomers
					},
					{
						icon: icons.InfoCircleIcon,
						name: 'Онлайн-клиенты',
						path: '/admin-panel/settings/online-customers',
						permission: ADMIN_PERMISSIONS.onlineCustomers
					}
				]
			},
			{
				icon: icons.PromotionsIcon,
				name: 'Промоакции',
				path: '/admin-panel/promotions/newsletter-subscribers',
				subItems: [
					{
						icon: icons.NewsletterSubscribersIcon,
						name: 'Подписчики рассылки',
						path: '/admin-panel/promotions/newsletter-subscribers',
						permission: ADMIN_PERMISSIONS.newsletterSubscribers
					},
					{
						icon: icons.TurkishLiraIcon,
						name: 'Скидки',
						path: '/admin-panel/promotions/discounts',
						permission: ADMIN_PERMISSIONS.discounts
					}
				]
			},
			{
				icon: icons.ConfigurationIcon,
				name: 'Конфигурация',
				path: '/admin-panel/configuration',
				subItems: [
					{
						icon: icons.DiscountLimitationsIcon,
						name: 'Ограничения скидок',
						path: '/admin-panel/configuration/discount-limitations',
						permission: ADMIN_PERMISSIONS.discountLimitations
					},
					{
						icon: icons.DiscountTypesIcon,
						name: 'Типы скидок',
						path: '/admin-panel/configuration/discount-types',
						permission: ADMIN_PERMISSIONS.discountTypes
					},
					// {
					// 	icon: icons.StoreIcon,
					// 	name: 'Настройки магазина',
					// 	path: '/admin-panel/configuration/stores',
					// 	permission: ADMIN_PERMISSIONS.stores
					// },
					// {
					// 	icon: icons.MailIcon,
					// 	name: 'Email-аккаунты',
					// 	path: '/admin-panel/configuration/email-accounts',
					// 	permission: ADMIN_PERMISSIONS.emailAccounts
					// },
					// {
					// 	icon: icons.PlugInIcon,
					// 	name: 'Способы доставки',
					// 	path: '/admin-panel/configuration/shipping-methods',
					// 	permission: ADMIN_PERMISSIONS.shippingMethods
					// },
					{
						icon: icons.CountriesIcon,
						name: 'Страны',
						path: '/admin-panel/configuration/countries',
						permission: ADMIN_PERMISSIONS.countries
					},
					{
						icon: icons.WarningIcon,
						name: 'Ограничения доставки по странам',
						path: '/admin-panel/configuration/shipping-restrictions',
						permission: ADMIN_PERMISSIONS.shippingRestrictions
					},
					// {
					// 	icon: icons.PlugInIcon,
					// 	name: 'Провайдер расчёта стоимости доставки',
					// 	path: '/admin-panel/configuration/shipping-providers',
					// 	permission: ADMIN_PERMISSIONS.shippingProviders
					// },
					{
						icon: icons.ClockIcon,
						name: 'Сроки доставки',
						path: '/admin-panel/configuration/delivery-times',
						permission: ADMIN_PERMISSIONS.deliveryDates
					}
					// {
					// 	icon: icons.CreditCardIcon,
					// 	name: 'Способы оплаты',
					// 	path: '/admin-panel/configuration/payment-methods',
					// 	permission: ADMIN_PERMISSIONS.paymentMethods
					// },
					// {
					// 	icon: icons.WarningIcon,
					// 	name: 'Ограничения оплаты по странам',
					// 	path: '/admin-panel/configuration/payment-restrictions',
					// 	permission: ADMIN_PERMISSIONS.paymentRestrictions
					// }
				]
			},
			{
				icon: icons.DocsIcon,
				name: 'Управление контентом',
				path: '/admin-panel/content-management',
				subItems: [
					{
						icon: icons.PageIcon,
						name: 'Страницы',
						path: '/admin-panel/content-management/topics',
						permission: ADMIN_PERMISSIONS.topics
					}
					// {
					// 	icon: icons.EditIcon,
					// 	name: 'Шаблоны email-сообщений',
					// 	path: '/admin-panel/content-management/message-templates',
					// 	permission: ADMIN_PERMISSIONS.messageTemplates
					// }
				]
			},
			{
				icon: icons.SystemIcon,
				name: 'Системный раздел',
				path: '/admin-panel/system',
				subItems: [
					{
						icon: icons.ActivityLogIcon,
						name: 'Лог активности',
						path: '/admin-panel/system/activity-log',
						permission: ADMIN_PERMISSIONS.activityLog
					},
					{
						icon: icons.SystemWarningsIcon,
						name: 'Системные уведомления',
						path: '/admin-panel/system/system-warnings',
						permission: ADMIN_PERMISSIONS.systemWarnings
					}
				]
			}
		]
	}
]

export const filterAdminMenuGroups = (
	groups: AdminMenuGroup[],
	userPermissions: string[],
	roles: string[]
): AdminMenuGroup[] =>
	groups
		.map((group) => ({
			items: filterAdminMenuItems(group.items, userPermissions, roles)
		}))
		.filter((group) => group.items.length > 0)

const filterAdminMenuItems = (items: AdminMenuItem[], userPermissions: string[], roles: string[]): AdminMenuItem[] =>
	items
		.map((item) => {
			if (item.subItems?.length) {
				const subItems = filterAdminMenuItems(item.subItems, userPermissions, roles)
				if (!subItems.length) return null

				return { ...item, subItems }
			}

			if (!canAccessPermission(item.permission, userPermissions, roles)) return null

			return item
		})
		.filter((item): item is AdminMenuItem => item !== null)
