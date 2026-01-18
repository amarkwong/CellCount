/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'deep-navy': '#1E3A5F',
        'clinical-white': '#FAFBFC',
        'slate-gray': '#64748B',

        // Cell Type Colors (Color-Blind Friendly)
        'cell-rbc': '#E07A5F',      // Coral Red
        'cell-wbc': '#3D5A80',      // Ocean Blue
        'cell-platelet': '#F2CC8F', // Amber Yellow

        // State Colors
        'state-success': '#059669',
        'state-warning': '#D97706',
        'state-error': '#DC2626',
        'state-selected': '#6366F1',

        // Neutral Scale
        'gray-50': '#F8FAFC',
        'gray-100': '#F1F5F9',
        'gray-200': '#E2E8F0',
        'gray-300': '#CBD5E1',
        'gray-400': '#94A3B8',
        'gray-500': '#64748B',
        'gray-600': '#475569',
        'gray-700': '#334155',
        'gray-800': '#1E293B',
        'gray-900': '#0F172A',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'cell-count-lg': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'cell-count-sm': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}
