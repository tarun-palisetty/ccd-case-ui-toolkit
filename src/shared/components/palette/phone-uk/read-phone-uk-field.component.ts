import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-phone-uk-field',
  template: `<span class="text-16">{{caseField.value}}</span>`
})
export class ReadPhoneUKFieldComponent extends AbstractFieldReadComponent {}
