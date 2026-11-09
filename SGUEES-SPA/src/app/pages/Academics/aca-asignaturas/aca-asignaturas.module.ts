import { AcaPeriodosCursoSharedModule } from '../aca-periodos-curso/aca-periodos-curso.module';
import { AcaTiposPracticaSharedModule } from '../aca-tipos-practica/aca-tipos-practica.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DxFormModule, DxDataGridModule, DxButtonModule, DxPopupModule, DxSelectBoxModule, DxLoadPanelModule, DxTabsModule } from 'devextreme-angular';
import { AcaAsignaturasComponent } from './aca-asignaturas.component';
@NgModule({
    imports: [CommonModule, AcaPeriodosCursoSharedModule, AcaTiposPracticaSharedModule, DxTabsModule, RouterModule.forChild([{ path: '', component: AcaAsignaturasComponent }]), DxFormModule, DxDataGridModule, DxButtonModule, DxPopupModule, DxSelectBoxModule, DxLoadPanelModule],
    declarations: [AcaAsignaturasComponent], exports: [RouterModule]
})
export class AcaAsignaturasModule {
}
