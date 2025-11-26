
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from 'src/app/shared/services/auth.service';
import { AppCanDeactivateGuard } from 'src/app/app-candeactivate.guard';
import { ComUnidadMedidaComponent } from './com-unidad-medida/com-unidad-medida.component';
import { ComProveedorComponent } from './com-proveedor/com-proveedor.component';
import { ComSoliCotizacionComponent } from './com-soli-cotizacion/com-soli-cotizacion.component';
import { ComCotizacionComponent } from './com-cotizacion/com-cotizacion.component';
import { ComBancoComponent } from './com-banco/com-banco.component';
import { ComCuadroComparativoComponent } from './com-cuadro-comparativo/com-cuadro-comparativo.component';
import { ComProveedorActuComponent } from './com-proveedor-actu/com-proveedor-actu.component';
import { ComTipoDocFisicoComponent } from './com-tipo-doc-fisico/com-tipo-doc-fisico.component';
import { ComParametroComponent } from './com-parametro/com-parametro.component';
import { ComCotizacionConsultaComponent } from './com-cotizacion-consulta/com-cotizacion-consulta.component';
import { ComCondicionPagoComponent } from './com-condicion-pago/com-condicion-pago.component';
import { ComCuadroComparativoConfigAutorizacionesComponent } from './com-cuadro-comparativo-config-autorizaciones/com-cuadro-comparativo-config-autorizaciones.component';
import { ComCuadroComparativoAutorizaComponent } from './com-cuadro-comparativo-autoriza/com-cuadro-comparativo-autoriza.component';
import { ComBitacoraComponent } from './com-bitacora/com-bitacora.component';
import { ComOrdenCompraComponent } from './com-orden-compra/com-orden-compra.component';
import { ComTipoSoliCotizaComponent } from './com-tipo-soli-cotiza/com-tipo-soli-cotiza.component';
import { ComDocumentoComponent } from './com-documento/com-documento.component';
import { ComDocumentoDesAplicarComponent } from './com-documento-desaplicar/com-documento-desaplicar.component';
import { ComDocumentoAnularComponent } from './com-documento-anular/com-documento-anular.component';

const routes: Routes = [
  {
    path: 'com-proveedor',
    component: ComProveedorComponent,
    data: { titulo: 'Registro de Proveedores' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-proveedor/com-proveedor.module').then(m => m.ComProveedorModule)
  },
  {
    path: 'com-proveedor-actu',
    component: ComProveedorActuComponent,
    data: { titulo: 'Actualizar Datos' },
    canActivate: [ AuthGuardService ],
    loadChildren: () => import('./com-proveedor-actu/com-proveedor-actu.module').then(m => m.ComProveedorActuModule)
  },
  {
    path: 'com-unidad-medida',
    component: ComUnidadMedidaComponent,
    data: { titulo: 'Unidades de Medida' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-unidad-medida/com-unidad-medida.module').then(m => m.ComUnidadMedidaModule)
  },
  {
    path: 'com-soli-cotizacion',
    component: ComSoliCotizacionComponent,
    data: { titulo: 'Solicitudes de Cotizaciones' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-soli-cotizacion/com-soli-cotizacion.module').then(m => m.ComSoliCotizacionModule)
  },
  {
    path: 'com-cotizacion',
    component: ComCotizacionComponent,
    data: { titulo: 'Oportunidades para Cotizar' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-cotizacion/com-cotizacion.module').then(m => m.ComCotizacionModule)
  },{
    path: 'com-cuadro-comparativo',
    component: ComCuadroComparativoComponent,
    data: { titulo: 'Cuadros Comparativos' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-cuadro-comparativo/com-cuadro-comparativo.module').then(m => m.ComCuadroComparativoModule)
  },
  {
    path: 'com-banco',
    component: ComBancoComponent,
    data: { titulo: 'Bancos' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-banco/com-banco.module').then(m => m.ComBancoModule)
  },
  {
    path: 'com-tipo-doc-fisico',
    component: ComTipoDocFisicoComponent,
    data: { titulo: 'Tipos de Doc. Fisicos' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-tipo-doc-fisico/com-tipo-doc-fisico.module').then(m => m.ComTipoDocFisicoModule)
  },
  {
    path: 'com-parametro',
    component: ComParametroComponent,
    data: { titulo: 'Parametros de Compras' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-parametro/com-parametro.module').then(m => m.ComParametroModule)
  },
  {
    path: 'com-cotizacion-consulta',
    component: ComCotizacionConsultaComponent,
    data: { titulo: 'Consulta de Cotizaciones' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-cotizacion-consulta/com-cotizacion-consulta.module').then(m => m.ComCotizacionConsultaModule)
  },
  {
    path: 'com-condicion-pago',
    component: ComCondicionPagoComponent,
    data: { titulo: 'Condiciónes de Pago' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-condicion-pago/com-condicion-pago.module').then(m => m.ComCondicionPagoModule)
  },
  {
    path: 'com-cuadro-comparativo-config-autorizaciones',
    component: ComCuadroComparativoConfigAutorizacionesComponent,
    data: { titulo: 'Configuración de Autorizaciones' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-cuadro-comparativo-config-autorizaciones/com-cuadro-comparativo-config-autorizaciones.module').then(m => m.ComCuadroComparativoConfigAutorizacionesModule)
  },
  {
    path: 'com-cuadro-comparativo-autoriza',
    component: ComCuadroComparativoAutorizaComponent,
    data: { titulo: 'Autorizar Cuadros Comparativos' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-cuadro-comparativo-autoriza/com-cuadro-comparativo-autoriza.module').then(m => m.ComCuadroComparativoAutorizaModule)
  },
  {
    path: 'com-bitacora',
    component: ComBitacoraComponent,
    data: { titulo: 'Bitacora' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-bitacora/com-bitacora.module').then(m => m.ComBitacoraModule)
  },
  {
    path: 'com-orden-compra',
    component: ComOrdenCompraComponent,
    data: { titulo: 'Orden de Compra' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-orden-compra/com-orden-compra.module').then(m => m.ComOrdenCompraModule)
  },
  {
    path: 'com-tipo-soli-cotiza',
    component: ComTipoSoliCotizaComponent,
    data: { titulo: 'Tipo de Sol. Cotización' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-tipo-soli-cotiza/com-tipo-soli-cotiza.module').then(m => m.ComTipoSoliCotizaModule)
  },
  {
    path: 'com-documento',
    component: ComDocumentoComponent,
    data: { titulo: 'Documentos por Compras' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-documento/com-documento.module').then(m => m.ComDocumentoModule)

  },
  {
    path: 'com-documento-desaplicar',
    component: ComDocumentoDesAplicarComponent,
    data: { titulo: 'Des-aplicar Doc. Compras' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-documento-desaplicar/com-documento-desaplicar.module').then(m => m.ComDocumentoDesAplicarModule)
  },
  {
    path: 'com-documento-anular',
    component: ComDocumentoAnularComponent,
    data: { titulo: 'Anular Comprobantes Ret.' },
    canActivate: [ AuthGuardService ],
    canDeactivate: [ AppCanDeactivateGuard ],
    loadChildren: () => import('./com-documento-anular/com-documento-anular.module').then(m => m.ComDocumentoAnularModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class ShopRoutingModule { }
