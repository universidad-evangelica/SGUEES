import {
  Component,
  OnInit,
  OnDestroy,
  NgModule,
  Input,
  ViewChild,
} from '@angular/core';
import { DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
import { DxDrawerModule, DxDrawerTypes } from 'devextreme-angular/ui/drawer';
import { DxScrollViewComponent, DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { CommonModule } from '@angular/common';

import { Router, RouterModule, NavigationEnd, Event } from '@angular/router';
import { ScreenService, AppInfoService } from '../../shared/services';
import { SideNavigationMenuModule } from 'src/app/shared/components/library/side-navigation-menu/side-navigation-menu.component';
import { AppHeaderModule } from 'src/app/shared/components/library/app-header/app-header.component';
import { AppFooterModule } from 'src/app/shared/components/library/app-footer/app-footer.component';
import { ToastModule } from 'primeng/toast';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-side-nav-outer-toolbar',
  templateUrl: './side-nav-outer-toolbar.component.html',
  styleUrls: ['./side-nav-outer-toolbar.component.scss'],
})
export class SideNavOuterToolbarComponent implements OnInit, OnDestroy {
  @ViewChild(DxScrollViewComponent, { static: true }) scrollView!: DxScrollViewComponent;

  @Input()
  title!: string;

  selectedRoute = '';

  menuOpened!: boolean;

  temporaryMenuOpened = false;

  menuMode: DxDrawerTypes.OpenedStateMode = 'shrink';

  menuRevealMode: DxDrawerTypes.RevealMode = 'expand';

  minMenuSize = 0;

  maxMenuSize = 320;

  shaderEnabled = false;

  routerSubscription: Subscription;

  screenSubscription: Subscription;

  constructor(private screen: ScreenService, private router: Router, public appInfo: AppInfoService) {
    this.routerSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.selectedRoute = event.urlAfterRedirects.split('?')[0];
      }
    });
  }

  ngOnInit() {
    this.menuOpened = this.screen.sizes['screen-large'];

    this.screenSubscription = this.screen.screenChanged
      .pipe(debounceTime(200))
      .subscribe(() => this.updateDrawer());

    this.updateDrawer();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
    this.screenSubscription.unsubscribe();
  }

  updateDrawer() {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];
    const wasOverlap = this.menuMode === 'overlap';

    const menuMode: DxDrawerTypes.OpenedStateMode = isLarge ? 'shrink' : 'overlap';
    // expand: el panel crece desde el borde izquierdo.
    // slide + transition CSS del tema dejaba el panel “flotando” con hueco a la izquierda.
    const menuRevealMode: DxDrawerTypes.RevealMode = 'expand';
    const maxMenuSize = isLarge ? 340 : isXSmall ? 280 : 320;
    const shaderEnabled = !isLarge;

    const modeChanged =
      this.menuMode !== menuMode ||
      this.menuRevealMode !== menuRevealMode ||
      this.maxMenuSize !== maxMenuSize ||
      this.shaderEnabled !== shaderEnabled;

    if (modeChanged) {
      this.menuMode = menuMode;
      this.menuRevealMode = menuRevealMode;
      this.minMenuSize = 0;
      this.maxMenuSize = maxMenuSize;
      this.shaderEnabled = shaderEnabled;
    }

    // Solo al cruzar el umbral desktop ↔ móvil/tablet (evita franja residual shrink→overlap).
    if (!isLarge && !wasOverlap) {
      this.menuOpened = false;
      this.temporaryMenuOpened = false;
    } else if (isLarge && wasOverlap) {
      this.menuOpened = true;
      this.temporaryMenuOpened = false;
    }
  }

  /** Toggle del ☰: en overlap el menú es temporal y debe cerrarse al navegar. */
  toggleMenu(): void {
    const willOpen = !this.menuOpened;
    this.menuOpened = willOpen;

    if (willOpen && this.menuMode === 'overlap') {
      this.temporaryMenuOpened = true;
    } else if (!willOpen) {
      this.temporaryMenuOpened = false;
    }
  }

  get hideMenuAfterNavigation() {
    // Mantener el menú fijo: solo cerrar si fue abierto temporalmente
    return this.temporaryMenuOpened;
  }

  get showMenuAfterClick() {
    return !this.menuOpened;
  }

  navigationChanged(event: DxTreeViewTypes.ItemClickEvent) {
    const path = (event.itemData as any).path;
    const pointerEvent = event.event;

    if (path && this.menuOpened) {
      if (event.node?.selected) {
        pointerEvent?.preventDefault();
      } else {
        this.router.navigate([path]);
      }

      if (this.hideMenuAfterNavigation) {
        this.temporaryMenuOpened = false;
        this.menuOpened = false;
        pointerEvent?.stopPropagation();
      }
    } else {
      pointerEvent?.preventDefault();
    }
  }

  navigationClick() {
    if (this.showMenuAfterClick) {
      this.temporaryMenuOpened = true;
      this.menuOpened = true;
    }
  }
}

@NgModule({
  imports: [
    RouterModule,
    SideNavigationMenuModule,
    DxDrawerModule,
    AppHeaderModule,
    DxScrollViewModule,
    CommonModule,
    AppFooterModule,
    ToastModule,
  ],
  exports: [SideNavOuterToolbarComponent],
  declarations: [SideNavOuterToolbarComponent],
})
export class SideNavOuterToolbarModule { }
