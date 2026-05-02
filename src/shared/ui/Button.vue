<template>
	<button
		:type="type"
		:class="[
			'inline-flex items-center justify-center font-semibold gap-2 rounded-xl transition-all duration-300 cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2',
			sizeClasses[size],
			variantClasses[variant],
			className,
			{ 'cursor-not-allowed opacity-50 grayscale': isDisabled }
		]"
		@click="onClick"
		:disabled="isDisabled"
	>
		<span
			v-if="loading"
			class="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			aria-hidden="true"
		/>
		<span v-if="startIcon" class="flex items-center">
			<component :is="startIcon" />
		</span>
		<slot></slot>
		<span v-if="endIcon" class="flex items-center">
			<component :is="endIcon" />
		</span>
	</button>
</template>

<script setup lang="ts">
	import { computed } from 'vue'

	interface ButtonProps {
		type?: 'button' | 'submit' | 'reset'
		size?: 'sm' | 'md' | 'icon'
		variant?: 'primary' | 'outline' | 'ghost'
		startIcon?: object
		endIcon?: object
		onClick?: () => void
		className?: string
		disabled?: boolean
		loading?: boolean
	}

	const props = withDefaults(defineProps<ButtonProps>(), {
		type: 'submit',
		size: 'md',
		variant: 'primary',
		className: '',
		disabled: false,
		loading: false
	})

	const sizeClasses = {
		sm: 'px-4 py-3 text-sm',
		md: 'px-5 py-3.5 text-sm',
		icon: 'h-9 w-9 p-0 text-sm'
	}

	const variantClasses = {
		primary:
			'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 focus:ring-blue-500',
		outline:
			'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-md focus:ring-gray-200',
		ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200'
	}

	const isDisabled = computed(() => props.disabled || props.loading)

	const onClick = () => {
		if (!isDisabled.value && props.onClick) {
			props.onClick()
		}
	}
</script>
