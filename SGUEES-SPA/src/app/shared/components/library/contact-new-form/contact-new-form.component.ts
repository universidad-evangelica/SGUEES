import {
  Component,
  NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxTextBoxModule,
  DxFormModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormTextboxModule } from 'src/app/shared/components/utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from 'src/app/shared/components/utils/form-photo-uploader/form-photo-uploader.component';
import { newContact } from 'src/app/types/contact';
import { getSizeQualifier } from 'src/app/shared/services/screen.service';

@Component({
  selector: 'contact-new-form',
  templateUrl: './contact-new-form.component.html',
  providers: [],
})

export class ContactNewFormComponent {
  newUser = newContact;
  getSizeQualifier = getSizeQualifier;
  constructor() { }

  getNewContactData = ()=> ({ ...this.newUser })
}

@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,

    FormTextboxModule,
    FormPhotoUploaderModule,

    CommonModule,
  ],
  declarations: [ContactNewFormComponent],
  exports: [ContactNewFormComponent],
})
export class ContactNewFormModule { }
