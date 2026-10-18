import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseModal } from './case-modal';

describe('CaseModal', () => {
  let component: CaseModal;
  let fixture: ComponentFixture<CaseModal>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaseModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
