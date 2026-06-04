import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';

export type SgueesStatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() tone: SgueesStatusTone = 'neutral';
}

@NgModule({
  imports: [CommonModule],
  declarations: [StatusBadgeComponent],
  exports: [StatusBadgeComponent],
})
export class StatusBadgeModule {}
