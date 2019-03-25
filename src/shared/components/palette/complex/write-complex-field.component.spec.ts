import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteComplexFieldComponent } from './write-complex-field.component';
import { DebugElement, Pipe, PipeTransform } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { By } from '@angular/platform-browser';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { MockComponent } from 'ng2-mock-component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { IsCompoundPipe } from '../utils/is-compound.pipe';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { IsReadOnlyPipe } from '../utils';
import createSpyObj = jasmine.createSpyObj;
import { newCaseField, createFieldType } from '../../../fixture';

describe('WriteComplexFieldComponent', () => {
  const $COMPLEX_PANEL = By.css('.form-group');
  const $COMPLEX_PANEL_TITLE = By.css('h2');
  const $COMPLEX_PANEL_VALUES = By.css('ccd-field-write');

  let FieldWriteComponent = MockComponent({
    selector: 'ccd-field-write',
    inputs: ['caseField', 'registerControl', 'idPrefix', 'isExpanded']
  });

  let FieldReadComponent = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'withLabel']
  });

  @Pipe({name: 'ccdIsReadOnly'})
  class MockIsReadOnlyPipe implements PipeTransform {
    transform(field: CaseField): boolean {
      if (!field || !field.display_context) {
        return false;
      }
      return field.display_context.toUpperCase() === 'READONLY';
    }
  }

  let fixture: ComponentFixture<WriteComplexFieldComponent>;
  let component: WriteComplexFieldComponent;
  let de: DebugElement;
  let formValidatorService: any;

  describe('when values split across children fields', () => {
    const FIELD_TYPE_WITH_MISSING_VALUE: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        newCaseField('AddressLine1', 'Line 1', null, null, 'OPTIONAL').withValue('').build(),
        newCaseField('AddressLine2', 'Line 2', null, null, 'OPTIONAL').withValue('111 East India road').build()
      ]
    };

    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        newCaseField('AddressLine1', 'Line 1', null, null, 'OPTIONAL').withValue('Flat 9').build(),
        newCaseField('AddressLine2', 'Line 2', null, null, 'OPTIONAL').withValue('111 East India road').build(),
        newCaseField('AddressPostcode', 'Post code', null,
          createFieldType('Postcode', 'Complex', [
            newCaseField('PostcodeCity', 'City', null, null, 'OPTIONAL').withValue('London').build(),
            newCaseField('PostcodeCountry', 'Country', null, null, 'OPTIONAL').withValue('UK').build(),
          ]), 'OPTIONAL').build()
      ]
    };

    const FIELD_ID = 'AComplexField';
    const CASE_FIELD: CaseField = newCaseField(FIELD_ID, 'Complex Field', null, FIELD_TYPE_WITH_VALUES, 'OPTIONAL').build();

    const LINE_1 = 0;
    const LINE_2 = 1;
    const POSTCODE = 2;

    const FORM_GROUP: FormGroup = new FormGroup({});
    const REGISTER_CONTROL = (control) => {
      FORM_GROUP.addControl(FIELD_ID, control);
      return control;
    };

    beforeEach(async(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule,
            ConditionalShowModule
          ],
          declarations: [
            WriteComplexFieldComponent,
            FieldsFilterPipe,

            // Mock
            FieldWriteComponent,
            FieldReadComponent,
            MockIsReadOnlyPipe
          ],
          providers: [
            IsCompoundPipe,
            IsReadOnlyPipe,
            { provide: FormValidatorsService, useValue: formValidatorService }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.registerControl = REGISTER_CONTROL;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render a form group with a header for the complex type', () => {
      let panelTitle = de
        .query($COMPLEX_PANEL)
        .query($COMPLEX_PANEL_TITLE);

      expect(panelTitle).toBeTruthy();
      expect(panelTitle.nativeElement.textContent).toBe(CASE_FIELD.label + ' (Optional)');
    });

    it('should render a field write component for each field in the complex type', () => {
      let simpleRowsHeaders = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_VALUES);

      expect(simpleRowsHeaders.length).toBe(3);
      expect(simpleRowsHeaders[LINE_1].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1].label);
      expect(simpleRowsHeaders[LINE_2].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2].label);
      expect(simpleRowsHeaders[POSTCODE].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[POSTCODE].label);
    });

    it('should render fields with empty value', () => {
      component.caseField = newCaseField('x', 'x', null, FIELD_TYPE_WITH_MISSING_VALUE, 'OPTIONAL').build();
      fixture.detectChanges();

      let labels = de.queryAll($COMPLEX_PANEL_VALUES);

      expect(labels.length).toEqual(2);

      expect(labels[LINE_1].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1].label);
      expect(labels[LINE_2].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2].label);
    });

    it('should return control if exists in formGroup', () => {
      const CASE_FIELD_1: CaseField = newCaseField(FIELD_ID, 'Complex Field', null, FIELD_TYPE_WITH_MISSING_VALUE, 'OPTIONAL').build();
      let firstControl = new FormControl();
      let formGroup = new FormGroup({});
      formGroup.addControl(FIELD_ID, firstControl);
      component.complexGroup = formGroup;
      fixture.detectChanges();
      let returned = component.buildControlRegistrer(CASE_FIELD_1).apply(firstControl);
      expect(returned).toBe(firstControl);
      expect(component.complexGroup.get(CASE_FIELD_1.id)).toBeTruthy();
    });

    it('should add control if it does not exist in formGroup', () => {
      const CASE_FIELD_1: CaseField = newCaseField('anotherComplexField', 'Complex Field', null,
        FIELD_TYPE_WITH_MISSING_VALUE, 'OPTIONAL').build();
      let firstControl = new FormControl();
      let formGroup = new FormGroup({});
      formGroup.addControl('first', firstControl);
      component.complexGroup = formGroup;
      fixture.detectChanges();
      let returned = component.buildControlRegistrer(CASE_FIELD_1) (firstControl);
      expect(returned).toBe(firstControl);
      expect(component.complexGroup.get(CASE_FIELD_1.id)).toBeTruthy();
      expect(component.complexGroup.get('first')).toBeTruthy();
    });
  });

  describe('when values as object in root field', () => {
    const FIELD_TYPE: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        newCaseField('AddressLine1', 'Line 1', null, null, 'OPTIONAL').build(),
        newCaseField('AddressLine2', 'Line 2', null, null, 'OPTIONAL').build(),
        newCaseField('AddressPostcode', 'Post code', null,
          createFieldType('Postcode', 'Complex', [
            newCaseField('PostcodeCity', 'City', null, null, 'OPTIONAL').build(),
            newCaseField('PostcodeCountry', 'Country', null, null, 'OPTIONAL').build(),
          ]), 'OPTIONAL').build()
      ]
    };

    const FIELD_ID = 'SomeFieldId';
    const CASE_FIELD: CaseField = newCaseField(FIELD_ID, 'Complex Field', null, FIELD_TYPE, 'OPTIONAL')
      .withValue({
        'AddressLine1': 'Flat 9',
        'AddressLine2': '111 East India road',
        'AddressPostcode': {
          'PostcodeCity': 'London',
          'PostcodeCountry': 'UK'
        }
      }).build();

    const LINE_1 = 0;
    const LINE_2 = 1;
    const POSTCODE = 2;

    let formGroup: FormGroup;
    const REGISTER_CONTROL = <T extends AbstractControl> (control: T) => {
      formGroup.addControl(FIELD_ID, control);
      return control;
    };

    beforeEach(async(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
      formGroup = new FormGroup({});

      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule,
            ConditionalShowModule
          ],
          declarations: [
            WriteComplexFieldComponent,
            FieldsFilterPipe,

            // Mock
            FieldWriteComponent,
            FieldReadComponent,
            MockIsReadOnlyPipe
          ],
          providers: [
            IsCompoundPipe,
            IsReadOnlyPipe,
            { provide: FormValidatorsService, useValue: formValidatorService }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.registerControl = REGISTER_CONTROL;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render a table with a row containing 2 columns for each simple type', () => {
      let values = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_VALUES);

      expect(values.length).toBe(3);

      let line1 = FIELD_TYPE.complex_fields[LINE_1];
      expect(values[LINE_1].componentInstance.caseField).toEqual(Object.assign(new CaseField(), {
        id: line1.id,
        label: line1.label,
        display_context: 'OPTIONAL',
        field_type: line1.field_type,
        hint_text: 'First name hint text',
        order: undefined,
        show_summary_content_option: 0,
        value: CASE_FIELD.value['AddressLine1']
      }));
      expect(values[LINE_1].componentInstance.registerControl).not.toBeNull();

      let line2 = FIELD_TYPE.complex_fields[LINE_2];
      expect(values[LINE_2].componentInstance.caseField).toEqual(Object.assign(new CaseField(), {
        id: line2.id,
        label: line2.label,
        display_context: 'OPTIONAL',
        field_type: line2.field_type,
        hint_text: 'First name hint text',
        order: undefined,
        show_summary_content_option: 0,
        value: CASE_FIELD.value['AddressLine2']
      }));
      expect(values[LINE_2].componentInstance.registerControl).not.toBeNull();

      let postcode = FIELD_TYPE.complex_fields[POSTCODE];
      expect(values[POSTCODE].componentInstance.caseField).toEqual(Object.assign(new CaseField(), {
        id: postcode.id,
        label: postcode.label,
        display_context: 'OPTIONAL',
        field_type: postcode.field_type,
        hint_text: 'First name hint text',
        order: undefined,
        show_summary_content_option: 0,
        value: CASE_FIELD.value['AddressPostcode']
      }));
      expect(values[POSTCODE].componentInstance.registerControl).not.toBeNull();
    });

    it('should render fields with empty value', () => {
      component.caseField = newCaseField('x', 'x', null, FIELD_TYPE, 'OPTIONAL')
        .withValue({
          'AddressLine1': 'Flat 9',
        }).build();
      fixture.detectChanges();

      let labels = de.queryAll($COMPLEX_PANEL_VALUES);

      expect(labels.length).toEqual(3);

      expect(labels[LINE_1].componentInstance.caseField.label).toBe(FIELD_TYPE.complex_fields[LINE_1].label);
      expect(labels[LINE_2].componentInstance.caseField.label).toBe(FIELD_TYPE.complex_fields[LINE_2].label);
    });

    it('should render label if set to true', () => {
      component.caseField = newCaseField('renderLabelId', 'Test Label', null, FIELD_TYPE, 'OPTIONAL')
        .withValue({
          'AddressLine1': 'Flat 9',
        }).build();
      component.renderLabel = true;
      fixture.detectChanges();
      expect(component.caseField.label).toBe('Test Label');
    });
  });

  describe('when display_context of AddressLine1 is MANDATORY', () => {
    const FIELD_TYPE_WITH_MISSING_VALUE: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        newCaseField('AddressLine1', 'Line 1', null,
          createFieldType('"TextMax150"', 'Text'), 'MANDATORY').withValue('').build(),
        newCaseField('AddressLine2', 'Line 2', null, null, 'OPTIONAL').withValue('111 East India road').build(),
      ]
    };

    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'TextMax150',
      type: 'Text'
    };

    const FIELD_ID = 'AComplexField';
    const CASE_FIELD_M: CaseField = newCaseField(FIELD_ID, 'Complex Field', null, FIELD_TYPE_WITH_VALUES, 'MANDATORY').build();

    const FORM_GROUP: FormGroup = new FormGroup({});
    const REGISTER_CONTROL = (control) => {
      FORM_GROUP.addControl(FIELD_ID, control);
      return control;
    };

    beforeEach(async(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);

      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule,
            ConditionalShowModule
          ],
          declarations: [
            WriteComplexFieldComponent,
            FieldsFilterPipe,

            // Mock
            FieldWriteComponent,
            FieldReadComponent,
            MockIsReadOnlyPipe
          ],
          providers: [
            IsCompoundPipe,
            IsReadOnlyPipe,
            { provide: FormValidatorsService, useValue: formValidatorService }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD_M;
      component.registerControl = REGISTER_CONTROL;
      component.ignoreMandatory = true;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should not add control when case field is not AddressLine1 and TextMax150', () => {
      const CASE_FIELD_1: CaseField = newCaseField('anotherComplexField', 'Complex Field', null,
        FIELD_TYPE_WITH_MISSING_VALUE, 'MANDATORY').build();
      const firstControl = new FormControl();
      const formGroup = new FormGroup({});
      formGroup.addControl('first', firstControl);
      component.complexGroup = formGroup;

      const returned = component.buildControlRegistrer(CASE_FIELD_1) (firstControl);
      expect(returned).toBe(firstControl);
      expect(component.complexGroup.get(CASE_FIELD_1.id)).toBeTruthy();
      expect(component.complexGroup.get('first')).toBeTruthy();
      expect(formValidatorService.addValidators).toHaveBeenCalledTimes(0);
    });

    it('should add control when case field is AddressLine1 and TextMax150', () => {
      component.caseField = newCaseField('AddressLine1', 'x', null, FIELD_TYPE_WITH_VALUES, 'MANDATORY')
        .withValue({
          'AddressLine1': 'Flat 9'
        }).build();
      const firstControl = new FormControl();
      const formGroup = new FormGroup({});
      formGroup.addControl('first', firstControl);
      component.complexGroup = formGroup;

      const returned = component.buildControlRegistrer(component.caseField) (firstControl);
      expect(returned).toBe(firstControl);
      expect(component.complexGroup.get(component.caseField.id)).toBeTruthy();
      expect(component.complexGroup.get('first')).toBeTruthy();
      expect(formValidatorService.addValidators).toHaveBeenCalledWith(component.caseField, firstControl);
    });

    it('should not add control when case field is AddressLine1 but NOT TextMax150', () => {
      component.caseField = newCaseField('AddressLine1', 'x', null,
        createFieldType('TextMax151', 'Text'), 'MANDATORY')
        .withValue({
          'AddressLine1': 'Flat 9'
        }).build();
      const firstControl = new FormControl();
      const formGroup = new FormGroup({});
      formGroup.addControl('first', firstControl);
      component.complexGroup = formGroup;

      const returned = component.buildControlRegistrer(component.caseField) (firstControl);
      expect(returned).toBe(firstControl);
      expect(component.complexGroup.get(component.caseField.id)).toBeTruthy();
      expect(component.complexGroup.get('first')).toBeTruthy();
      expect(formValidatorService.addValidators).toHaveBeenCalledTimes(0);
    });

    it('should not add control when case field is NOT AddressLine1', () => {
      component.caseField = newCaseField('AddressLine2', 'x', null,
        createFieldType('TextMax150', 'Text'), 'MANDATORY')
        .withValue({
          'AddressLine1': 'Flat 9'
        }).build();
      const firstControl = new FormControl();
      const formGroup = new FormGroup({});
      formGroup.addControl('first', firstControl);
      component.complexGroup = formGroup;

      const returned = component.buildControlRegistrer(component.caseField) (firstControl);
      expect(returned).toBe(firstControl);
      expect(component.complexGroup.get(component.caseField.id)).toBeTruthy();
      expect(component.complexGroup.get('first')).toBeTruthy();
      expect(formValidatorService.addValidators).toHaveBeenCalledTimes(0);
    });
  });

});
