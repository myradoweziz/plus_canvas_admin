<template>
	<button
		type="submit"
		:class="[
			'inline-flex items-center justify-center font-semibold gap-2 rounded-xl transition-all duration-300 cursor-pointer active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2',
			sizeClasses[size],
			variantClasses[variant],
			className,
			{ 'cursor-not-allowed opacity-50 grayscale': disabled }
		]"
		@click="onClick"
		:disabled="disabled"
	>
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
	interface ButtonProps {
		size?: 'sm' | 'md'
		variant?: 'primary' | 'outline'
		startIcon?: object
		endIcon?: object
		onClick?: () => void
		className?: string
		disabled?: boolean
	}

	const props = withDefaults(defineProps<ButtonProps>(), {
		size: 'md',
		variant: 'primary',
		className: '',
		disabled: false
	})

	const sizeClasses = {
		sm: 'px-4 py-3 text-sm',
		md: 'px-5 py-3.5 text-sm'
	}

	const variantClasses = {
		primary: 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-300 focus:ring-blue-500',
		outline: 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:shadow-md focus:ring-gray-200'
	}

	const onClick = () => {
		if (!props.disabled && props.onClick) {
			props.onClick()
		}
	}
</script>
