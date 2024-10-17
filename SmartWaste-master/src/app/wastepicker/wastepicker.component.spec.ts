import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WastepickerComponent } from './wastepicker.component';

describe('WastepickerComponent', () => {
  let component: WastepickerComponent;
  let fixture: ComponentFixture<WastepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WastepickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WastepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
