import { NgModule } from '@angular/core';
import { ActionButtonModule } from './action-button/action-button.component';
import { EmptyStateModule } from './empty-state/empty-state.component';
import { GridToolbarModule } from './grid-toolbar/grid-toolbar.component';
import { PageHeaderModule } from './page-header/page-header.component';
import { SearchBoxModule } from './search-box/search-box.component';
import { SectionCardModule } from './section-card/section-card.component';
import { StatusBadgeModule } from './status-badge/status-badge.component';

/** FASE 5E — Barrel del Design System SGUEES */
@NgModule({
  exports: [
    PageHeaderModule,
    SectionCardModule,
    GridToolbarModule,
    SearchBoxModule,
    ActionButtonModule,
    StatusBadgeModule,
    EmptyStateModule,
  ],
})
export class SgueesDesignSystemModule {}
