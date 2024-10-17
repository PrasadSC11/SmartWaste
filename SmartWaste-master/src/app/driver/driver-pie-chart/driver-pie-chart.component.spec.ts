import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverPieChartComponent } from './driver-pie-chart.component';

describe('DriverPieChartComponent', () => {
  let component: DriverPieChartComponent;
  let fixture: ComponentFixture<DriverPieChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DriverPieChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
