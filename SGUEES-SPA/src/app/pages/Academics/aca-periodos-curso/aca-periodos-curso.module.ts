import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DxFormModule, DxDataGridModule, DxButtonModule, DxPopupModule, DxSelectBoxModule } from 'devextreme-angular';
import { AcaPeriodosCursoComponent } from './aca-periodos-curso.component';
@NgModule({imports:[CommonModule,DxFormModule,DxDataGridModule,DxButtonModule,DxPopupModule,DxSelectBoxModule],declarations:[AcaPeriodosCursoComponent],exports:[AcaPeriodosCursoComponent]})
export class AcaPeriodosCursoSharedModule {}
@NgModule({imports:[AcaPeriodosCursoSharedModule,RouterModule.forChild([{path:'',component:AcaPeriodosCursoComponent}])],exports:[RouterModule]})
export class AcaPeriodosCursoModule {}
