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

    const menuMode: DxDrawerTypes.OpenedStateMode = isLarge ? 'shrink' : 'overlap';
    const menuRevealMode: DxDrawerTypes.RevealMode = isLarge ? 'expand' : 'slide';
    const maxMenuSize = isLarge ? 340 : isXSmall ? 280 : 320;
    const shaderEnabled = !isLarge;

    if (
      this.menuMode === menuMode &&
      this.menuRevealMode === menuRevealMode &&
      this.maxMenuSize === maxMenuSize &&
      this.shaderEnabled === shaderEnabled
    ) {
      return;
    }

    this.menuMode = menuMode;
    this.menuRevealMode = menuRevealMode;
    this.minMenuSize = 0;
    this.maxMenuSize = maxMenuSize;
    this.shaderEnabled = shaderEnabled;
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
    AppFooterModule
  ],
  exports: [SideNavOuterToolbarComponent],
  declarations: [SideNavOuterToolbarComponent],
})
export class SideNavOuterToolbarModule { }
