import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndCaseModal } from './end-case-modal';

describe('EndCaseModalComponent', () => {
  let component: EndCaseModal;
  let fixture: ComponentFixture<EndCaseModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndCaseModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndCaseModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
