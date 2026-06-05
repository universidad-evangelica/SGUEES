import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  @Input() title = 'Sin registros';
  @Input() message = 'No hay datos para mostrar en este momento.';
  @Input() icon = 'inactivefolder';
  @Input() ctaLabel = '';
  @Input() ctaIcon = 'plus';
  @Output() ctaClick = new EventEmitter<void>();

  onCta(): void {
    this.ctaClick.emit();
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [EmptyStateComponent],
  exports: [EmptyStateComponent],
})
export class EmptyStateModule {}
