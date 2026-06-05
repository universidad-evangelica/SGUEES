import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface SgueesBreadcrumbItem {
  label: string;
  route?: string | any[];
}

/** Alias público (Fase 7A). */
export type BreadcrumbItem = SgueesBreadcrumbItem;

export type PageHeaderVariant = 'default' | 'enterprise';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() compact = false;
  @Input() variant: PageHeaderVariant = 'default';
  @Input() breadcrumbs: SgueesBreadcrumbItem[] | null = null;
  @Input() eyebrow = '';

  get isEnterprise(): boolean {
    return this.variant === 'enterprise';
  }
}

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [PageHeaderComponent],
  exports: [PageHeaderComponent],
})
export class PageHeaderModule {}
