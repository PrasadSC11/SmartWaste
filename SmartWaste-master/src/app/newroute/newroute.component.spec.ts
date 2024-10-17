import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewrouteComponent } from './newroute.component';

describe('NewrouteComponent', () => {
  let component: NewrouteComponent;
  let fixture: ComponentFixture<NewrouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewrouteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewrouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
