<script setup lang="ts">
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

	import { CheckIcon, ChevronDownIcon, ClearIcon } from '@/shared/icons'

	type SelectOption = {
		label: string
		value: string | number | null
		disabled?: boolean
	}

	const props = withDefaults(
		defineProps<{
			label: string
			name: string
			modelValue?: string | number | null
			options: SelectOption[]
			placeholder?: string
			disabled?: boolean
			errorMessage?: string
			remoteSearch?: boolean
		}>(),
		{
			modelValue: null,
			placeholder: 'Select option',
			disabled: false,
			remoteSearch: false
		}
	)

	const emit = defineEmits<{
		(e: 'update:modelValue', value: string | number | null): void
		(e: 'search', value: string): void
	}>()

	const dropdownRef = ref<HTMLElement | null>(null)
	const searchInputRef = ref<HTMLInputElement | null>(null)
	const isOpen = ref(false)
	const searchQuery = ref('')

	const selectedOption = computed(() =>
		props.options.find((option) => String(option.value) === String(props.modelValue))
	)

	const hasValue = computed(() => props.modelValue !== null && props.modelValue !== undefined && props.modelValue !== '')

	const filteredOptions = computed(() => {
		if (props.remoteSearch) return props.options

		const query = searchQuery.value.trim().toLowerCase()

		if (!query) return props.options

		return props.options.filter((option) => option.label.toLowerCase().includes(query))
	})

	const openDropdown = async () => {
		if (props.disabled) return
		isOpen.value = true
		await nextTick()
		searchInputRef.value?.focus()
	}

	const toggleDropdown = () => {
		if (isOpen.value) {
			closeDropdown()
			return
		}

		openDropdown()
	}

	const closeDropdown = () => {
		isOpen.value = false
		searchQuery.value = ''
	}

	const selectOption = (option: SelectOption) => {
		if (option.disabled) return
		emit('update:modelValue', option.value)
		closeDropdown()
	}

	const clearValue = () => {
		emit('update:modelValue', null)
		closeDropdown()
	}

	watch(searchQuery, (value) => {
		emit('search', value.trim())
	})

	const handleDocumentClick = (event: MouseEvent) => {
		if (!dropdownRef.value?.contains(event.target as Node)) {
			closeDropdown()
		}
	}

	onMounted(() => {
		document.addEventListener('click', handleDocumentClick)
	})

	onBeforeUnmount(() => {
		document.removeEventListener('click', handleDocumentClick)
	})
</script>

<template>
	<div ref="dropdownRef">
		<label class="mb-1.5 block text-sm font-medium text-gray-700">{{ label }}</label>
		<div class="relative">
			<button
				type="button"
				:name="name"
				:disabled="disabled"
				@click="toggleDropdown"
				:class="[
					'flex h-12 w-full items-center rounded-xl border bg-white px-4 py-3 text-left text-sm transition-all duration-300 shadow-sm outline-none',
					hasValue ? 'text-gray-900' : 'text-gray-400',
					errorMessage
						? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100'
						: 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
					disabled ? 'cursor-not-allowed bg-gray-50 text-gray-400' : 'hover:border-blue-300',
					hasValue && !disabled ? 'pr-20' : 'pr-11'
				]"
			>
				<span class="block truncate">{{ selectedOption?.label ?? placeholder }}</span>
			</button>

			<button
				v-if="hasValue && !disabled"
				type="button"
				class="absolute right-10 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
				aria-label="Clear selected option"
				@click.stop="clearValue"
			>
				<ClearIcon />
			</button>

			<span
				:class="[
					'pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition-transform duration-200',
					isOpen ? 'rotate-180' : ''
				]"
			>
				<ChevronDownIcon />
			</span>

			<transition
				enter-active-class="transition duration-150 ease-out"
				enter-from-class="-translate-y-1 opacity-0"
				enter-to-class="translate-y-0 opacity-100"
				leave-active-class="transition duration-100 ease-in"
				leave-from-class="translate-y-0 opacity-100"
				leave-to-class="-translate-y-1 opacity-0"
			>
				<div
					v-if="isOpen"
					class="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
				>
					<div class="sticky top-0 z-10 bg-white p-2">
						<input
							ref="searchInputRef"
							v-model.trim="searchQuery"
							type="search"
							class="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
							placeholder="Search..."
							@click.stop
						/>
					</div>

					<button
						v-for="option in filteredOptions"
						:key="String(option.value)"
						type="button"
						:disabled="option.disabled"
						@click="selectOption(option)"
						:class="[
							'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
							String(option.value) === String(modelValue)
								? 'bg-blue-50 font-medium text-blue-700'
								: 'text-gray-700 hover:bg-gray-50',
							option.disabled ? 'cursor-not-allowed opacity-50' : ''
						]"
					>
						<span class="truncate">{{ option.label }}</span>
						<CheckIcon v-if="String(option.value) === String(modelValue)" />
					</button>

					<p v-if="filteredOptions.length === 0" class="px-3 py-2.5 text-sm text-gray-400">
						{{ options.length === 0 ? 'No options' : 'Nothing found' }}
					</p>
				</div>
			</transition>

			<p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
		</div>
	</div>
</template>
