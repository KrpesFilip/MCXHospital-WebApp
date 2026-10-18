import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortOption } from '../../hospital-services/sorting-cases.service';

@Component({
  selector: 'app-custom-sort-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cases-sort.component.html',
  styleUrls: ['./cases-sort.component.scss']
})
export class CustomSortDropdownComponent {
  @Input() sortOptions: { value: SortOption; label: string }[] = [];
  @Input() selectedOption: SortOption = 'time-newest';
  @Output() sortChange = new EventEmitter<SortOption>();

  isOpen = false;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: SortOption) {
    this.selectedOption = option;
    this.sortChange.emit(option);
    this.isOpen = false;
  }

  getSelectedLabel(): string {
    return this.sortOptions.find(opt => opt.value === this.selectedOption)?.label || 'Sort';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}