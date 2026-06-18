import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
})
export class SearchBoxComponent {
  @Input() value = '';
  @Input() placeholder = 'Buscar...';
  @Input() width: string | number = '100%';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  onValueChanged(e: { value?: string }): void {
    this.valueChange.emit(e.value ?? '');
  }
}

@NgModule({
  imports: [CommonModule, DxTextBoxModule],
  declarations: [SearchBoxComponent],
  exports: [SearchBoxComponent],
})
export class SearchBoxModule {}
