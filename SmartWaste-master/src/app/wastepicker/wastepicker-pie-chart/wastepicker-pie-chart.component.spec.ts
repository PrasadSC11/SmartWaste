import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WastepickerPieChartComponent } from './wastepicker-pie-chart.component';

describe('WastepickerPieChartComponent', () => {
  let component: WastepickerPieChartComponent;
  let fixture: ComponentFixture<WastepickerPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WastepickerPieChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WastepickerPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
