import { currentTheme as currentVizTheme, refreshTheme } from 'devextreme/viz/themes';
import themes from 'devextreme/ui/themes';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  APP_THEMES,
  AppThemeDefinition,
  DEFAULT_THEME_ID,
  findThemeById,
  isSupportedThemeId,
} from '../config/theme-catalog';

const STORAGE_KEY = 'app-theme-id';
const FLUENT_BUNDLE_MARKER = 'theme-';

type ThemeCssApi = {
  attachCssClasses: (element: Element, themeName?: string) => void;
  detachCssClasses: (element: Element) => void;
};

const themeCss = themes as unknown as ThemeCssApi;

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  readonly themes = APP_THEMES;

  currentThemeDefinition: AppThemeDefinition = findThemeById(DEFAULT_THEME_ID);

  public isDark = new BehaviorSubject<boolean>(this.currentThemeDefinition.isDark);
  public themeChanged = new BehaviorSubject<AppThemeDefinition>(this.currentThemeDefinition);

  constructor() {
    this.migrateLegacyThemePreference();
    themes.initialized(() => {
      setTimeout(() => this.applyTheme(this.currentThemeDefinition, false), 0);
    });
  }

  private migrateLegacyThemePreference(): void {
    const storedId = window.localStorage.getItem(STORAGE_KEY);

    if (isSupportedThemeId(storedId)) {
      this.currentThemeDefinition = findThemeById(storedId);
      this.isDark.next(this.currentThemeDefinition.isDark);
      this.themeChanged.next(this.currentThemeDefinition);
      return;
    }

    if (storedId?.startsWith('generic-')) {
      window.localStorage.setItem(STORAGE_KEY, DEFAULT_THEME_ID);
    }

    const legacy = window.localStorage.getItem('app-theme');
    if (legacy === 'light' || legacy === 'dark') {
      this.currentThemeDefinition = findThemeById(legacy === 'light' ? 'fluent-blue-light' : 'fluent-blue-dark');
      window.localStorage.setItem(STORAGE_KEY, this.currentThemeDefinition.id);
      this.isDark.next(this.currentThemeDefinition.isDark);
      this.themeChanged.next(this.currentThemeDefinition);
    }
  }

  getCurrentTheme(): AppThemeDefinition {
    return this.currentThemeDefinition;
  }

  getCurrentThemeId(): string {
    return this.currentThemeDefinition.id;
  }

  get currentTheme(): 'light' | 'dark' {
    return this.currentThemeDefinition.isDark ? 'dark' : 'light';
  }

  /** Siempre Fluent SGUEES (compatibilidad con componentes legacy). */
  isFluent(): boolean {
    return true;
  }

  setAppTheme(themeId?: string): void {
    this.applyTheme(findThemeById(themeId ?? this.currentThemeDefinition.id), true);
  }

  setThemeById(themeId: string): void {
    if (!themeId || themeId === this.currentThemeDefinition.id) {
      return;
    }
    this.applyTheme(findThemeById(themeId), true);
  }

  switchTheme(): void {
    const nextTheme = this.currentThemeDefinition.id === 'fluent-blue-dark'
      ? findThemeById('fluent-blue-light')
      : findThemeById('fluent-blue-dark');
    this.applyTheme(nextTheme, true);
  }

  resetToDefaultTheme(): void {
    window.localStorage.setItem(STORAGE_KEY, DEFAULT_THEME_ID);
    this.applyTheme(findThemeById(DEFAULT_THEME_ID), true);
  }

  private getViewPortElement(): HTMLElement {
    return (document.querySelector('.dx-viewport') ?? document.body) as HTMLElement;
  }

  private applyTheme(definition: AppThemeDefinition, persist: boolean): void {
    this.currentThemeDefinition = definition;
    this.isDark.next(definition.isDark);
    this.themeChanged.next(definition);

    document.body.classList.remove('sguees-theme-dark', 'sguees-theme-light', 'sguees-theme-generic');
    document.body.classList.add(definition.isDark ? 'sguees-theme-dark' : 'sguees-theme-light');

    this.removeLegacyGenericStylesheet();
    this.setFluentBundles(definition.bundleKey);
    this.applyDevExtremeTheme(definition);

    if (persist) {
      window.localStorage.setItem(STORAGE_KEY, definition.id);
    }
  }

  private applyDevExtremeTheme(definition: AppThemeDefinition): void {
    const viewport = this.getViewPortElement();
    themeCss.detachCssClasses(viewport);
    themeCss.attachCssClasses(viewport, definition.dxThemeName);

    try {
      currentVizTheme(definition.dxThemeName);
    } catch {
      // refreshTheme recalcula widgets aunque el viz theme no exista con el mismo nombre.
    }
    refreshTheme();
  }

  private getFluentBundleLinks(): HTMLLinkElement[] {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(
      (node): node is HTMLLinkElement =>
        node instanceof HTMLLinkElement && !!node.href?.includes(FLUENT_BUNDLE_MARKER)
    );
  }

  private setFluentBundles(activeBundle: 'light' | 'dark'): void {
    this.getFluentBundleLinks().forEach((link) => {
      link.disabled = !link.href.includes(`${FLUENT_BUNDLE_MARKER}${activeBundle}`);
    });
  }

  /** Limpia CSS Generic de sesiones anteriores (ya no se usa). */
  private removeLegacyGenericStylesheet(): void {
    const legacyLink = document.getElementById('sguees-devextreme-generic-theme') as HTMLLinkElement | null;
    if (legacyLink) {
      legacyLink.disabled = true;
      legacyLink.remove();
    }
  }
}
