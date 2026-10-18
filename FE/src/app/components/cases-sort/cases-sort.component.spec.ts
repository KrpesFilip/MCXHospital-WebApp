import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSortDropdownComponent } from './cases-sort.component';

describe('CustomSortDropdownComponent', () => {
  let component: CustomSortDropdownComponent;
  let fixture: ComponentFixture<CustomSortDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSortDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSortDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
