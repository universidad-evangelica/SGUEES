import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DxTabsModule, DxTabsTypes } from 'devextreme-angular/ui/tabs';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BecaConvenioTab, BecaConvenioTabId, BECAS_CONVENIOS_TABS } from './becas-convenios.navigation';

@Component({
  selector: 'app-becas-convenios-tabs',
  standalone: true,
  imports: [DxTabsModule],
  template: `
    <nav aria-label="Mantenimientos de entidades, convenios y financiadores">
      <dx-tabs [items]="tabs" [selectedIndex]="indiceSeleccionado" [disabled]="bloqueado"
        [showNavButtons]="true" [scrollByContent]="true" width="100%"
        (onItemClick)="seleccionar($event)">
      </dx-tabs>
    </nav>
  `,
  styles: [`:host { display: block; margin-top: var(--sguees-space-3, 12px); }`],
})
export class BecasConveniosTabsComponent {
  @Input() activa: BecaConvenioTabId = 'convenios';
  @Input() bloqueado = false;
  readonly tabs: BecaConvenioTab[];

  constructor(appInfo: AppInfoService, private navigation: Router) {
    this.tabs = BECAS_CONVENIOS_TABS.filter(tab => (appInfo.getPermiso(tab.path) ?? '').includes('R'));
  }

  get indiceSeleccionado(): number {
    return Math.max(0, this.tabs.findIndex(tab => tab.id === this.activa));
  }

  seleccionar(event: DxTabsTypes.ItemClickEvent): void {
    const tab = this.tabs.find(item => item.id === event.itemData?.id);
    if (this.bloqueado || !tab || tab.id === this.activa) return;
    void this.navigation.navigate([tab.path]);
  }
}
