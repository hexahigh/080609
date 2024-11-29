import type { Config } from 'tailwindcss'

export default {
  // darkMode: "selector",
  darkMode: ['variant', ['&:where(.dark, .dark *)', '&:where(:global(.dark), :global(.dark) *)']], // Fix for dark mode after upgrade to svelte 5
  content: ["./src/**/*.{html,js,svelte,ts}"],
  plugins: [
	require('@tailwindcss/typography'),
  ]
} satisfies Config