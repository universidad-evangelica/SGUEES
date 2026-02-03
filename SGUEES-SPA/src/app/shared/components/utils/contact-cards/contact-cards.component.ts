import {
  Component, NgModule, Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxTabPanelModule,
  DxDataGridModule,
} from 'devextreme-angular';
import { CardNotesModule } from 'src/app/shared/components/library/card-notes/card-notes.component';
import { CardMessagesModule } from 'src/app/shared/components/library/card-messages/card-messages.component';
import { CardActivitiesModule } from 'src/app/shared/components/library/card-activities/card-activities.component';
import { CardOpportunitiesModule } from 'src/app/shared/components/library/card-opportunities/card-opportunities.component';
import { CardTasksModule } from 'src/app/shared/components/library/card-tasks/card-tasks.component';
import { Activity } from 'src/app/types/activities';
import { Messages } from 'src/app/types/messages';
import { Notes } from 'src/app/types/notes';
import { Opportunities } from 'src/app/types/opportunities';
import { Task } from 'src/app/types/task';

@Component({
  selector: 'contact-cards',
  templateUrl: './contact-cards.component.html',
  styleUrls: ['./contact-cards.component.scss'],
})
export class ContactCardsComponent {
    @Input() tasks: Task[];

    @Input() activities: Activity[];

    @Input() activeOpportunities: Opportunities;

    @Input() closedOpportunities: Opportunities;

    @Input() notes: Notes;

    @Input() messages: Messages;

    @Input() contactName: string;

    @Input() isLoading: boolean;
}

@NgModule({
  imports: [
    DxButtonModule,
    DxTabPanelModule,
    DxDataGridModule,

    CardNotesModule,
    CardMessagesModule,
    CardActivitiesModule,
    CardOpportunitiesModule,
    CardTasksModule,

    CommonModule,
  ],
  providers: [],
  exports: [ContactCardsComponent],
  declarations: [ContactCardsComponent],
})
export class ContactCardsModule { }
