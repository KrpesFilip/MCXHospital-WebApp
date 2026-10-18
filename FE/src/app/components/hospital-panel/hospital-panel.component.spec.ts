import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalPanelComponent } from './hospital-panel.component';

describe('HospitalPanelComponent', () => {
  let component: HospitalPanelComponent;
  let fixture: ComponentFixture<HospitalPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
