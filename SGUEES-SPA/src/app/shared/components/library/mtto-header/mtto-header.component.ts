import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';

@Component({
  selector: 'app-mtto-header',
  templateUrl: './mtto-header.component.html',
  styleUrls: ['./mtto-header.component.scss'],
})
export class MttoHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}

@NgModule({
  imports: [CommonModule],
  declarations: [MttoHeaderComponent],
  exports: [MttoHeaderComponent],
})
export class MttoHeaderModule {}
