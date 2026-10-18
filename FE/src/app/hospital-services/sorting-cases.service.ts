import { Injectable } from '@angular/core';
import { CaseModel } from '../hospital-models/case-model';

export type SortOption = 'priority-high-low' | 'priority-low-high' | 'time-newest' | 'time-oldest';

@Injectable({ providedIn: 'root' })
export class CaseSortService {
  private priorityOrder = { 'SOS': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };

  /**
   * Sort cases based on selected option
   * Default: priority-high-low (SOS > HIGH > MEDIUM > LOW, then newest first)
   */
  sortCases(cases: CaseModel[], option: SortOption = 'priority-high-low'): CaseModel[] {
    const sorted = [...cases];

    switch (option) {
      case 'priority-high-low':
        return sorted.sort((a, b) => this.sortByPriorityHighLow(a, b));
      
      case 'priority-low-high':
        return sorted.sort((a, b) => this.sortByPriorityLowHigh(a, b));
      
      case 'time-newest':
        return sorted.sort((a, b) => this.sortByTimeNewest(a, b));
      
      case 'time-oldest':
        return sorted.sort((a, b) => this.sortByTimeOldest(a, b));
      
      default:
        return sorted.sort((a, b) => this.sortByPriorityHighLow(a, b));
    }
  }

  /**
   * Priority HIGH to LOW (SOS > HIGH > MEDIUM > LOW), then newest first
   */
  private sortByPriorityHighLow(a: CaseModel, b: CaseModel): number {
    const aIsSos = this.isSos(a);
    const bIsSos = this.isSos(b);
    
    if (aIsSos && !bIsSos) return -1;
    if (!aIsSos && bIsSos) return 1;

    const aPriority = aIsSos ? 0 : (this.priorityOrder[a.priority] ?? 999);
    const bPriority = bIsSos ? 0 : (this.priorityOrder[b.priority] ?? 999);
    
    if (aPriority !== bPriority) return aPriority - bPriority;

    return this.compareTime(b, a);
  }

  /**
   * Priority LOW to HIGH (LOW > MEDIUM > HIGH > SOS), then newest first
   */
  private sortByPriorityLowHigh(a: CaseModel, b: CaseModel): number {
    const aIsSos = this.isSos(a);
    const bIsSos = this.isSos(b);
    
    if (aIsSos && !bIsSos) return 1;
    if (!aIsSos && bIsSos) return -1;

    const aPriority = aIsSos ? 0 : (this.priorityOrder[a.priority] ?? 999);
    const bPriority = bIsSos ? 0 : (this.priorityOrder[b.priority] ?? 999);
    
    if (aPriority !== bPriority) return bPriority - aPriority;

    return this.compareTime(b, a);
  }

  /**
   * Time NEWEST to OLDEST
   */
  private sortByTimeNewest(a: CaseModel, b: CaseModel): number {
    return this.compareTime(b, a);
  }

  /**
   * Time OLDEST to NEWEST
   */
  private sortByTimeOldest(a: CaseModel, b: CaseModel): number {
    return this.compareTime(a, b);
  }

  /**
   * Compare creation time
   */
  private compareTime(a: CaseModel, b: CaseModel): number {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return aTime - bTime;
  }

  /**
   * Check if case has SOS active
   */
  private isSos(c: CaseModel): boolean {
    return c.isSos;
  }

  /**
   * Get display label for sort option
   */
  getSortLabel(option: SortOption): string {
    switch (option) {
      case 'priority-high-low':
        return 'Priority: High → Low';
      case 'priority-low-high':
        return 'Priority: Low → High';
      case 'time-newest':
        return 'Time: Newest first';
      case 'time-oldest':
        return 'Time: Oldest first';
      default:
        return 'Sort';
    }
  }

  /**
   * Get all available sort options
   */
  getSortOptions(): { value: SortOption; label: string }[] {
    return [
      { value: 'priority-high-low', label: 'Priority: High → Low' },
      { value: 'priority-low-high', label: 'Priority: Low → High' },
      { value: 'time-newest', label: 'Time: Newest first' },
      { value: 'time-oldest', label: 'Time: Oldest first' }
    ];
  }
}