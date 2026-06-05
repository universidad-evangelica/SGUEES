import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

/** Contenedor visual para acciones de grid/toolbar (proyección de contenido). */
@Component({
  selector: 'app-grid-toolbar',
  templateUrl: './grid-toolbar.component.html',
  styleUrls: ['./grid-toolbar.component.scss'],
})
export class GridToolbarComponent {}

@NgModule({
  imports: [CommonModule],
  declarations: [GridToolbarComponent],
  exports: [GridToolbarComponent],
})
export class GridToolbarModule {}
