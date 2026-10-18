import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SosModal } from './sos-modal';

describe('SosModalComponent', () => {
  let component: SosModal;
  let fixture: ComponentFixture<SosModal>;    
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SosModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SosModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
