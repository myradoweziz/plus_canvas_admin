import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const DiscountLimitations = () => import('./pages/DiscountLimitations.vue')
const DiscountTypes = () => import('./pages/DiscountTypes.vue')
const Stores = () => import('./pages/Stores.vue')
const EmailAccounts = () => import('./pages/EmailAccounts.vue')
const ShippingMethods = () => import('./pages/ShippingMethods.vue')
const Countries = () => import('./pages/Countries.vue')
const StoreForm = () => import('./components/stores/StoreForm.vue')
const EmailAccountForm = () => import('./components/email-accounts/EmailAccountForm.vue')
const ShippingMethodForm = () => import('./components/shipping-methods/ShippingMethodForm.vue')
const CountryForm = () => import('./components/countries/CountryForm.vue')
const ShippingRestrictions = () => import('./pages/ShippingRestrictions.vue')
const ShippingProviders = () => import('./pages/ShippingProviders.vue')
const ShippingProviderForm = () => import('./components/shipping-providers/ShippingProviderForm.vue')
const DeliveryTimes = () => import('./pages/DeliveryTimes.vue')
const DeliveryDateForm = () => import('./components/delivery-times/DeliveryDateForm.vue')
const PaymentMethods = () => import('./pages/PaymentMethods.vue')
const PaymentMethodForm = () => import('./components/payment-methods/PaymentMethodForm.vue')
const PaymentRestrictions = () => import('./pages/PaymentRestrictions.vue')

const moduleRoute = {
	path: '/admin-panel/configuration',
	component: Module,
	children: [
		{
			path: '',
			redirect: 'discount-limitations'
		},
		{
			path: 'discount-limitations',
			component: DiscountLimitations,
			meta: { title: 'Ограничения скидок', layout: Layouts.admin }
		},
		{
			path: 'discount-types',
			component: DiscountTypes,
			meta: { title: 'Типы скидок', layout: Layouts.admin }
		},
		{
			path: 'stores',
			component: Stores,
			meta: { title: 'Настройки магазина', layout: Layouts.admin }
		},
		{
			path: 'stores/create',
			component: StoreForm,
			meta: { title: 'Добавить магазин', layout: Layouts.admin }
		},
		{
			path: 'stores/:id/edit',
			component: StoreForm,
			meta: { title: 'Редактировать магазин', layout: Layouts.admin }
		},
		{
			path: 'email-accounts',
			component: EmailAccounts,
			meta: { title: 'Email-аккаунты', layout: Layouts.admin }
		},
		{
			path: 'email-accounts/create',
			component: EmailAccountForm,
			meta: { title: 'Добавить email-аккаунт', layout: Layouts.admin }
		},
		{
			path: 'email-accounts/:id/edit',
			component: EmailAccountForm,
			meta: { title: 'Редактировать email-аккаунт', layout: Layouts.admin }
		},
		{
			path: 'shipping-methods',
			component: ShippingMethods,
			meta: { title: 'Способы доставки', layout: Layouts.admin }
		},
		{
			path: 'shipping-methods/create',
			component: ShippingMethodForm,
			meta: { title: 'Добавить способ доставки', layout: Layouts.admin }
		},
		{
			path: 'shipping-methods/:id/edit',
			component: ShippingMethodForm,
			meta: { title: 'Редактировать способ доставки', layout: Layouts.admin }
		},
		{
			path: 'countries',
			component: Countries,
			meta: { title: 'Страны', layout: Layouts.admin }
		},
		{
			path: 'countries/create',
			component: CountryForm,
			meta: { title: 'Добавить страну', layout: Layouts.admin }
		},
		{
			path: 'countries/:id/edit',
			component: CountryForm,
			meta: { title: 'Редактировать страну', layout: Layouts.admin }
		},
		{
			path: 'shipping-restrictions',
			component: ShippingRestrictions,
			meta: { title: 'Ограничения доставки по странам', layout: Layouts.admin }
		},
		{
			path: 'shipping-providers',
			component: ShippingProviders,
			meta: { title: 'Провайдеры расчёта доставки', layout: Layouts.admin }
		},
		{
			path: 'shipping-providers/create',
			component: ShippingProviderForm,
			meta: { title: 'Добавить провайдера доставки', layout: Layouts.admin }
		},
		{
			path: 'shipping-providers/:id/edit',
			component: ShippingProviderForm,
			meta: { title: 'Редактировать провайдера доставки', layout: Layouts.admin }
		},
		{
			path: 'delivery-times',
			component: DeliveryTimes,
			meta: { title: 'Сроки доставки', layout: Layouts.admin }
		},
		{
			path: 'delivery-times/create',
			component: DeliveryDateForm,
			meta: { title: 'Добавить срок доставки', layout: Layouts.admin }
		},
		{
			path: 'delivery-times/:id/edit',
			component: DeliveryDateForm,
			meta: { title: 'Редактировать срок доставки', layout: Layouts.admin }
		},
		{
			path: 'payment-methods',
			component: PaymentMethods,
			meta: { title: 'Способы оплаты', layout: Layouts.admin }
		},
		{
			path: 'payment-methods/create',
			component: PaymentMethodForm,
			meta: { title: 'Добавить способ оплаты', layout: Layouts.admin }
		},
		{
			path: 'payment-methods/:id/edit',
			component: PaymentMethodForm,
			meta: { title: 'Редактировать способ оплаты', layout: Layouts.admin }
		},
		{
			path: 'payment-restrictions',
			component: PaymentRestrictions,
			meta: { title: 'Ограничения оплаты по странам', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
