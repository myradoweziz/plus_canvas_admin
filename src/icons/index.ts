import { defineComponent, h } from 'vue'

type IconProps = {
  size?: number | string
  class?: string
}

function iconBase(
  name: string,
  pathD: string,
  { filled = false }: { filled?: boolean } = {}
) {
  return defineComponent<IconProps>({
    name,
    props: {
      size: { type: [Number, String], default: 20 },
      class: { type: String, default: '' }
    },
    setup(props) {
      return () =>
        h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: props.size,
            height: props.size,
            viewBox: '0 0 24 24',
            fill: filled ? 'currentColor' : 'none',
            stroke: filled ? 'none' : 'currentColor',
            'stroke-width': filled ? undefined : 2,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            class: props.class,
            'aria-hidden': 'true'
          },
          [h('path', { d: pathD })]
        )
    }
  })
}

export const SuccessIcon = iconBase(
  'SuccessIcon',
  'M20 6L9 17l-5-5'
)

export const ErrorIcon = iconBase(
  'ErrorIcon',
  'M18 6L6 18M6 6l12 12'
)

export const WarningIcon = iconBase(
  'WarningIcon',
  'M12 9v4m0 4h.01M10.29 3.86l-8.2 14.2A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.73-2.94l-8.2-14.2a2 2 0 0 0-3.42 0z'
)

export const InfoCircleIcon = iconBase(
  'InfoCircleIcon',
  'M12 16v-4m0-4h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z'
)

export const UserCircleIcon = iconBase(
  'UserCircleIcon',
  'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z'
)

export const ChevronDownIcon = iconBase(
  'ChevronDownIcon',
  'M6 9l6 6 6-6'
)

export const LogoutIcon = iconBase(
  'LogoutIcon',
  'M10 17l1.41-1.41L8.83 13H21v-2H8.83l2.58-2.59L10 7l-7 7 7 7z'
)

export const SettingsIcon = iconBase(
  'SettingsIcon',
  'M12 15.5a3.5 3.5 0 1 0-3.5-3.5 3.5 3.5 0 0 0 3.5 3.5zm8.94-2.5a7.86 7.86 0 0 0 .06-1 7.86 7.86 0 0 0-.06-1l2.12-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.28 7.28 0 0 0-1.73-1l-.38-2.65A.5.5 0 0 0 15.5 1h-4a.5.5 0 0 0-.5.42l-.38 2.65a7.28 7.28 0 0 0-1.73 1l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L5.06 10a7.86 7.86 0 0 0-.06 1 7.86 7.86 0 0 0 .06 1l-2.12 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1a7.28 7.28 0 0 0 1.73 1l.38 2.65a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.38-2.65a7.28 7.28 0 0 0 1.73-1l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64z'
)

