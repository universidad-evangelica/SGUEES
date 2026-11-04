import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-section-card',
  templateUrl: './section-card.component.html',
  styleUrls: ['./section-card.component.scss'],
})
export class SectionCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() padding: 'default' | 'compact' = 'default';
}

@NgModule({
  imports: [CommonModule],
  declarations: [SectionCardComponent],
  exports: [SectionCardComponent],
})
export class SectionCardModule {}
