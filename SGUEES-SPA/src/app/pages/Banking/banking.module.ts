import { NgModule } from '@angular/core';
import { BankingRoutingModule } from './banking-routing.module';
import { BanReporteModule } from './ban-reporte/ban-reporte.module';

@NgModule({
	imports: [BankingRoutingModule, BanReporteModule],
})
export class BankingModule {}