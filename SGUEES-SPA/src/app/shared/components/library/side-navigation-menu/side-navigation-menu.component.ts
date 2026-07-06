import {
  Component,
  NgModule,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { take } from 'rxjs/internal/operators/take';
import { DxTreeViewModule, DxTreeViewComponent, DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
import * as events from 'devextreme/events';
import { AuthService } from '../../../services';

@Component({
  selector: 'side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrls: ['./side-navigation-menu.component.scss'],
})
export class SideNavigationMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild(DxTreeViewComponent, { static: true })
  menu!: DxTreeViewComponent;

  @Output()
  selectedItemChanged = new EventEmitter<DxTreeViewTypes.ItemClickEvent>();

  @Output()
  openMenu = new EventEmitter<any>();

  @Input()
  get compactMode() {
    return this._compactMode;
  }

  @Input()
  set selectedItem(value: String) {
    this._selectedItem = value;
    this.setSelectedItem();
  }

  get selectedItem(): String {
    return this._selectedItem;
  }

  set compactMode(val) {
    this._compactMode = val;

    if (!this.menu.instance) {
      return;
    }

    if (val) {
      this.menu.instance.collapseAll();
    } else {
      const key = this.findMenuKeyByPath(this._items, String(this._selectedItem || ''));
      if (key) {
        this.menu.instance.expandItem(key);
      }
    }
  }

  private _selectedItem!: String;

  private _items: Record<string, unknown>[] = [];

  get items() {
    return this._items;
  }

  private _compactMode = false;

  private _menuLoaded = false;

  constructor(private elementRef: ElementRef, private authService: AuthService) {
    this.loadMenu();
  }

  private loadMenu(): void {
    if (this._menuLoaded) {
      return;
    }

    this._menuLoaded = true;
    this.authService
      .getMenu()
      .pipe(take(1))
      .subscribe((response: any) => {
        const menu = Array.isArray(response?.Data) ? response.Data : [];
        this._items = this.normalizeMenuItems(menu);
        setTimeout(() => this.setSelectedItem());
      });
  }

  private normalizeMenuItems(items: any[], prefix = ''): any[] {
    return (items || [])
      .map((item) => {
        const code = String(item.code || item.text || 'node');
        const menuKey = prefix ? `${prefix}/${code}` : code;
        let path = item.path;

        if (path && !/^\//.test(path)) {
          path = `/${path}`;
        }

        const normalized: any = {
          ...item,
          path,
          menuKey,
          expanded: !this._compactMode,
        };

        if (Array.isArray(item.items) && item.items.length > 0) {
          normalized.items = this.normalizeMenuItems(item.items, menuKey);
        } else {
          delete normalized.items;
        }

        return normalized;
      })
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  }

  private findMenuKeyByPath(items: any[], path: string): string | null {
    for (const item of items || []) {
      if (item.path === path) {
        return item.menuKey;
      }

      if (item.items?.length) {
        const found = this.findMenuKeyByPath(item.items, path);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  setSelectedItem() {
    if (!this.menu.instance || !this._selectedItem) {
      return;
    }

    const key = this.findMenuKeyByPath(this._items, String(this._selectedItem));
    if (key) {
      this.menu.instance.selectItem(key);
    }
  }

  onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
    this.selectedItemChanged.emit(event);
  }

  ngAfterViewInit() {
    this.setSelectedItem();
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);
    });
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }
}

@NgModule({
  imports: [DxTreeViewModule],
  declarations: [SideNavigationMenuComponent],
  exports: [SideNavigationMenuComponent],
})
export class SideNavigationMenuModule {}
