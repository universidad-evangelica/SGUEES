// Qué hace: módulo Angular de unidades por tipo de usuario.
// Cómo: importa el routing module que declara el componente y sus dependencias DevExtreme/layout.
import { NgModule } from '@angular/core';
import { ScUnidadesTipoUsuarioRoutingModule } from './sc-unidades-tipo-usuario-routing.module';

@NgModule({
	imports: [ScUnidadesTipoUsuarioRoutingModule],
})
// Qué hace: módulo contenedor del mantenimiento de unidades por rol.
// Cómo: solo reexporta ScUnidadesTipoUsuarioRoutingModule (lazy load).
export class ScUnidadesTipoUsuarioModule {}
