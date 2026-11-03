import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DxFormModule, DxDataGridModule, DxButtonModule, DxPopupModule, DxSelectBoxModule } from 'devextreme-angular';
import { AcaTiposPracticaComponent } from './aca-tipos-practica.component';
@NgModule({imports:[CommonModule,DxFormModule,DxDataGridModule,DxButtonModule,DxPopupModule,DxSelectBoxModule],declarations:[AcaTiposPracticaComponent],exports:[AcaTiposPracticaComponent]})
export class AcaTiposPracticaSharedModule {}
@NgModule({imports:[AcaTiposPracticaSharedModule,RouterModule.forChild([{path:'',component:AcaTiposPracticaComponent}])],exports:[RouterModule]})
export class AcaTiposPracticaModule {}
