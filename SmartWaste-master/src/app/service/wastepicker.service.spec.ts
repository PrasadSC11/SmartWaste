import { TestBed } from '@angular/core/testing';

import { WastePickerService } from './wastepicker.service';

describe('WastepickerService', () => {
  let service: WastePickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WastePickerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
