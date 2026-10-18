import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsPanelComponent } from './ems-panel.component';

describe('EmsPanelComponent', () => {
  let component: EmsPanelComponent;
  let fixture: ComponentFixture<EmsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
