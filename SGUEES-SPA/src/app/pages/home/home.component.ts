import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services';
import { HomeService } from './home.service';
import { MessageService } from 'primeng/api';
import { take } from 'rxjs/operators';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: [ './home.component.scss' ]
})

export class HomeComponent implements OnInit {
  selectedSection: PortalSection | null = null;
  selectedMenuTab: PortalMenuTab | null = null;
  sections: PortalSection[] = [];
  favoritesSelected: PortalChild[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private homeService: HomeService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.ensureDecodedToken();
    this.loadAuthorizedSections();
  }

  onParentClick(section: PortalSection): void {
    this.selectedSection = section;
    this.selectedMenuTab = section.menuTabs[0] ?? null;
  }

  onMenuTabClick(tab: PortalMenuTab): void {
    this.selectedMenuTab = tab;
  }

  goBackToParents(): void {
    this.selectedSection = null;
    this.selectedMenuTab = null;
  }

  get activeChildren(): PortalChild[] {
    return this.selectedMenuTab?.children ?? [];
  }

  onChildClick(child: PortalChild): void {
    if (child.disabled || !child.route) {
      return;
    }

    // if (!this.authService.hasReadPermission(child.permissionKey)) {
    //   return;
    // }

    this.router.navigateByUrl(child.route);
  }

  private ensureDecodedToken(): void {
    if (this.authService.decodedToken) {
      return;
    }

    const token = localStorage.getItem('token') || '';
    if (!token || this.authService.jwtHelper.isTokenExpired(token)) {
      return;
    }

    try {
      this.authService.decodedToken = this.authService.jwtHelper.decodeToken(token);
    } catch {
      this.authService.decodedToken = null;
    }
  }

  private loadAuthorizedSections(): void {
    this.authService.getMainMenu().pipe(take(1)).subscribe({
      next: (menu) => {
        this.sections = this.buildAuthorizedSections(menu);
        this.restoreSelectedSectionState();
        this.getFavoritesByUser();
      },
      error: (error) => {
        console.error(error);
        this.sections = [];
      }
    });
  }

  private restoreSelectedSectionState(): void {
    if (!this.selectedSection) {
      return;
    }

    const section = this.sections.find((item) => item.id === this.selectedSection?.id);
    if (!section) {
      this.selectedSection = null;
      this.selectedMenuTab = null;
      return;
    }

    this.selectedSection = section;
    this.selectedMenuTab =
      section.menuTabs.find((tab) => tab.id === this.selectedMenuTab?.id) ||
      section.menuTabs[0] ||
      null;
  }

  private buildAuthorizedSections(menu: MenuItem[]): PortalSection[] {
    return (menu || [])
      .filter((item) => !this.isHomeMenuItem(item))
      .map((item) => ({
        id: this.getSectionId(item),
        title: item.text || item.code || '',
        icon: this.normalizeIcon(item.icon),
        menuTabs: this.extractMenuTabs(item),
      }))
      .filter((section) => section.title && section.menuTabs.length > 0);
  }

  private extractMenuTabs(section: MenuItem): PortalMenuTab[] {
    return (section.items || [])
      .map((menu) => ({
        id: this.getMenuTabId(menu),
        title: menu.text || menu.code || menu.codeMenu || '',
        icon: this.normalizeIcon(menu.icon),
        order: menu.order ?? 0,
        children: this.extractAuthorizedOptions(menu),
      }))
      .filter((tab) => tab.title && tab.children.length > 0)
      .sort((a, b) => a.order - b.order);
  }

  private extractAuthorizedOptions(menu: MenuItem): PortalChild[] {
    const children: PortalChild[] = [];
    const usedRoutes = new Set<string>();

    const options = [...(menu.items || [])].sort(
      (left, right) => (left.order ?? 0) - (right.order ?? 0)
    );

    options.forEach((option) => {
      const route = this.normalizePath(option.path);

      if (!route || this.isHomeRoute(route)) {
        return;
      }

      const child: PortalChild = {
        title: option.text || option.code || route,
        icon: this.normalizeIcon(option.icon),
        route,
        permissionKey: route,
      };

      if (!usedRoutes.has(route) && this.isChildAuthorized(child)) {
        usedRoutes.add(route);
        children.push(child);
      }
    });

    return children;
  }

  private isChildAuthorized(child: PortalChild): boolean {
    if (child.disabled || !child.route) {
      return false;
    }

    return this.authService.hasReadPermission(child.permissionKey);
  }

  private normalizePath(path?: string): string {
    const normalizedPath = (path || '').trim();

    if (!normalizedPath) {
      return '';
    }

    return normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  }

  private getSectionId(item: MenuItem): string {
    return (item.code || item.codeSistema || item.text || '').toString().toLowerCase();
  }

  private getMenuTabId(item: MenuItem): string {
    return (item.code || item.codeMenu || item.text || '').toString().toLowerCase();
  }

  private normalizeIcon(icon?: string): string {
    const value = (icon || '').trim();

    if (!value || value.includes('undefined') || value.startsWith('mdi')) {
      return 'folder';
    }

    return value;
  }

  private isHomeMenuItem(item: MenuItem): boolean {
    return this.isHomeRoute(this.normalizePath(item.path)) || (item.code || '').toLowerCase() === 'home';
  }

  private isHomeRoute(route: string): boolean {
    return route === '/home' || route === '/';
  }

  //agregar a favoritos  
  onFavoriteClick(
    child: PortalChild,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    const request = {
      corr_Empresa: 1,
      usuario: this.authService.decodedToken.nameid,
      permission_Key: child.permissionKey,
      module_Name: child.title,
      route: child.route
    };

    // console.log('REQUEST FAVORITO', request);
    // console.log('CHILD', child);

    this.homeService
      .toggleFavorite(request)
      .subscribe({
        next: (response: ToggleFavoriteResponse) => {
          child.isFavorite = response.IS_FAVORITE;

          this.getFavoritesByUser();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.IS_FAVORITE
              ? 'Favorito añadido'
              : 'Favorito eliminado'
          });

          console.log(response);
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  // Obtener favoritos al cargar la página
  getFavoritesByUser(){
    this.homeService.getFavorites(
      1,
      this.authService.decodedToken.nameid
    ).subscribe({
      next: (favorites: FavoriteApiItem[]) => {
        this.favoritesSelected = [];

        this.sections.forEach((section) => {
          section.menuTabs.forEach((tab) => {
            tab.children.forEach((child) => {
              child.isFavorite = false;
            });
          });
        });

        favorites.forEach((fav) => {
          this.sections.forEach((section) => {
            section.menuTabs.forEach((tab) => {
              tab.children.forEach((child) => {
                if (child.permissionKey === fav.PERMISSION_KEY) {
                  child.isFavorite = true;
                  this.favoritesSelected.push(child);
                }
              });
            });
          });
        });
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

}

type PortalChild = {
  title: string;
  icon: string;
  permissionKey: string;
  route?: string;
  disabled?: boolean;
  isFavorite?: boolean;
};

type PortalMenuTab = {
  id: string;
  title: string;
  icon: string;
  order: number;
  children: PortalChild[];
};

type PortalSection = {
  id: string;
  title: string;
  icon: string;
  menuTabs: PortalMenuTab[];
};

type ToggleFavoriteResponse = {
  IS_FAVORITE: boolean;
  MESSAGE?: string;
};

type FavoriteApiItem = {
  PERMISSION_KEY: string;
};

type MenuItem = {
  code?: string;
  codeMenu?: string;
  codeSistema?: string;
  text?: string;
  icon?: string;
  path?: string;
  order?: number;
  items?: MenuItem[] | null;
};
