import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AcaOfertaNuevoIngresoComponent } from './aca-oferta-nuevo-ingreso.component';
import { AcaOfertaAdmisionComponent } from '../aca-periodos-academicos/ciclos/aca-oferta-admision.component';
@NgModule({imports:[CommonModule,AcaOfertaAdmisionComponent,RouterModule.forChild([{path:'',component:AcaOfertaNuevoIngresoComponent}])],declarations:[AcaOfertaNuevoIngresoComponent],exports:[RouterModule]})
export class AcaOfertaNuevoIngresoModule {}
