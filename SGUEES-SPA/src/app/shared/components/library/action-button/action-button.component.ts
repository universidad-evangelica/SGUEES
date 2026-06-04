import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';

@Component({
  selector: 'app-action-button',
  templateUrl: './action-button.component.html',
  styleUrls: ['./action-button.component.scss'],
})
export class ActionButtonComponent {
  @Input() text = '';
  @Input() icon = '';
  @Input() type: 'default' | 'success' | 'danger' | 'normal' = 'default';
  @Input() stylingMode: 'contained' | 'outlined' | 'text' = 'contained';
  @Input() disabled = false;
  @Input() visible = true;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    this.clicked.emit();
  }
}

@NgModule({
  imports: [CommonModule, DxButtonModule],
  declarations: [ActionButtonComponent],
  exports: [ActionButtonComponent],
})
export class ActionButtonModule {}
