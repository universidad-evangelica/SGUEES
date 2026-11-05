import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { DxTabsModule, DxTabsTypes } from 'devextreme-angular/ui/tabs';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BECAS_CONFIGURACION_TABS, BECAS_CUESTIONARIO_TABS, BecaConfiguracionTabId } from './becas-configuracion.navigation';

@Component({
  selector: 'app-becas-configuracion-tabs', standalone: true, imports: [CommonModule, DxTabsModule],
  template: `
    <nav [attr.aria-label]="esCuestionario ? 'Cuestionario de becas' : 'Configuración de becas'">
      <dx-tabs [items]="tabs" [selectedIndex]="indiceSeleccionado" [disabled]="bloqueado"
        [showNavButtons]="true" [scrollByContent]="true" width="100%" (onItemClick)="seleccionar($event)">
      </dx-tabs>
      <p *ngIf="mostrarContexto && esCuestionario && corrBeca > 0">Beca seleccionada: {{ nombreBeca || ('N.º ' + corrBeca) }}</p>
      <p *ngIf="mostrarContexto && esCuestionario && corrBeca <= 0">Seleccione una beca para consultar su formulario, documentos y requisitos.</p>
    </nav>`,
  styles: [`:host { display:block; margin-top:var(--sguees-space-3,12px); } p { margin:12px 0; overflow-wrap:anywhere; }`],
})
export class BecasConfiguracionTabsComponent implements OnChanges {
  @Input() activa: BecaConfiguracionTabId = 'tipos';
  @Input() corrBeca = 0;
  @Input() nombreBeca = '';
  @Input() mostrarContexto = true;
  @Input() bloqueado = false;
  tabs: (typeof BECAS_CONFIGURACION_TABS[number] & { disabled: boolean })[] = [];
  get esCuestionario():boolean {return ['formularios','requisitos','documentos'].includes(this.activa);}
  constructor(private appInfo: AppInfoService, private navigation: Router) {}
  ngOnChanges(): void {
    const grupo=this.esCuestionario?BECAS_CUESTIONARIO_TABS:BECAS_CONFIGURACION_TABS;
    this.tabs=grupo.filter(tab=>(this.appInfo.getPermiso(tab.id==='formularios'?'/aca-bec-tipo':tab.path) ?? '').includes('R'))
      .map(tab=>({...tab,disabled:!!tab.requiereBeca&&this.corrBeca<=0}));
  }
  get indiceSeleccionado(): number { return Math.max(0, this.tabs.findIndex(tab => tab.id === this.activa)); }
  seleccionar(event: DxTabsTypes.ItemClickEvent): void {
    const tab = this.tabs.find(item => item.id === event.itemData?.id);
    if (this.bloqueado || !tab || tab.disabled || tab.id === this.activa) return;
    void this.navigation.navigate([tab.path], { queryParams: { beca: this.corrBeca > 0 ? this.corrBeca : null } });
  }
}
