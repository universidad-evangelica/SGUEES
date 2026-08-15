/** Paleta de preview para el selector (colores oficiales Fluent Blue). */
export interface ThemePreviewPalette {
  previewBg: string;
  previewSurface: string;
  previewAccent: string;
  previewText: string;
  previewBorder: string;
}

export interface AppThemeDefinition extends ThemePreviewPalette {
  id: string;
  name: string;
  isDark: boolean;
  dxThemeName: string;
  bundleKey: 'light' | 'dark';
}

export const APP_THEMES: AppThemeDefinition[] = [
  {
    id: 'fluent-blue-dark',
    name: 'Fluent Blue Dark',
    isDark: true,
    dxThemeName: 'fluent.blue.dark',
    bundleKey: 'dark',
    previewBg: '#1f1f1f',
    previewSurface: '#292929',
    previewAccent: '#479ef5',
    previewText: '#ffffff',
    previewBorder: '#616161',
  },
  {
    id: 'fluent-blue-light',
    name: 'Fluent Blue Light',
    isDark: false,
    dxThemeName: 'fluent.blue.light',
    bundleKey: 'light',
    previewBg: '#fafafa',
    previewSurface: '#ffffff',
    previewAccent: '#0f6cbd',
    previewText: '#242424',
    previewBorder: '#e0e0e0',
  },
];

export const DEFAULT_THEME_ID = 'fluent-blue-dark';

export function findThemeById(themeId: string | null | undefined): AppThemeDefinition {
  return APP_THEMES.find((theme) => theme.id === themeId)
    ?? APP_THEMES.find((theme) => theme.id === DEFAULT_THEME_ID)!;
}

export function isSupportedThemeId(themeId: string | null | undefined): boolean {
  return !!themeId && APP_THEMES.some((theme) => theme.id === themeId);
}
