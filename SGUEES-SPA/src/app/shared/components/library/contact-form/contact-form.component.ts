import {
  Component, NgModule, Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxFormModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { ContactStatusModule } from 'src/app/shared/components/utils/contact-status/contact-status.component';
import { FormTextboxModule } from 'src/app/shared/components/utils/form-textbox/form-textbox.component';
import { FormPhotoModule } from 'src/app/shared/components/utils/form-photo/form-photo.component';
import { StatusSelectBoxModule } from 'src/app/shared/components/library/status-select-box/status-select-box.component';
import { Contact } from 'src/app/types/contact';
import { ValidationRule } from 'devextreme-angular/common';
import { DxButtonTypes } from 'devextreme-angular/ui/button';
import { ToolbarFormModule } from 'src/app/shared/components/utils/toolbar-form/toolbar-form.component';

@Component({
  selector: 'contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
  @Input() contactData: Contact;

  @Input() isLoading: boolean;

  savedData: Contact = null;

  isEditing = false;

  zipCodeValidator: ValidationRule = { type: 'pattern', pattern: /^\d{5}$/, message: 'Zip is invalid' };

  handleEditClick() {
    this.savedData = { ...this.contactData };
    this.isEditing = true;
  }

  handleSaveClick({ validationGroup }: DxButtonTypes.ClickEvent) {
    if(!validationGroup.validate().isValid) return;
    this.isEditing = false;
    this.savedData = null;
  }

  handleCancelClick() {
    this.contactData = { ...this.savedData };
    this.isEditing = false;
  }
}

@NgModule({
  imports: [
    DxFormModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxLoadPanelModule,
    DxValidationGroupModule,

    FormTextboxModule,
    ContactStatusModule,
    FormPhotoModule,
    DxValidatorModule,
    ToolbarFormModule,
    CommonModule,
    StatusSelectBoxModule,
  ],
  providers: [],
  exports: [ContactFormComponent],
  declarations: [ContactFormComponent],
})
export class ContactFormModule { }
