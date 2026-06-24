import { NgModule } from '@angular/core';
import { AccountingRoutingModule } from './accounting-routing.module';
import { ConPartidaOperacionModule } from './con-partida-operacion/con-partida-operacion.module';

@NgModule({
  imports: [
    AccountingRoutingModule,
    ConPartidaOperacionModule,
  ]
})
export class AccountingModule { }
