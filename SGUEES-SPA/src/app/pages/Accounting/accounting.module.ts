import { NgModule } from '@angular/core';
import { AccountingRoutingModule } from './accounting-routing.module';
import { ConPartidaOperacionModule } from './con-partida-operacion/con-partida-operacion.module';
import { ConReporteModule } from './con-reporte/con-reporte.module';

@NgModule({
	imports: [AccountingRoutingModule, ConPartidaOperacionModule, ConReporteModule],
})
export class AccountingModule {}
