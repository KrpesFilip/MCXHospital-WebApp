import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CaseService } from '../../hospital-services/case-store.service';
import { CaseModel } from '../../hospital-models/case-model';
import { CaseSortService, SortOption } from '../../hospital-services/sorting-cases.service';
import { CustomSortDropdownComponent } from '../../components/cases-sort/cases-sort.component';
import { OverlayModalComponent } from '../../components/overlay-modal/overlay-modal.component';
import { AuthService } from '../../services/auth.service';
import { formatCoordinate } from '../../utils/format-coordinate';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, CustomSortDropdownComponent, DatePipe, OverlayModalComponent, Header],
  templateUrl: './archive.component.html',
  styleUrl: './archive.component.scss'
})
export class ArchiveComponent implements OnInit {
  private caseService = inject(CaseService);
  private sortService = inject(CaseSortService);
  private router = inject(Router);
  readonly authService = inject(AuthService);

  archivedCases: CaseModel[] = [];
  sortOption: SortOption = 'time-newest';
  sortOptions = this.sortService.getSortOptions();
  selectedCase: CaseModel | null = null;
  currentYear: number = new Date().getFullYear();

  formatCoordinate = formatCoordinate;

  ngOnInit() {
    this.loadArchivedCases();
  }

  loadArchivedCases() {
    // Get all cases and filter only inactive ones (archived)
    this.caseService.getAllCases().subscribe(() => {
      this.archivedCases = this.caseService.getCasesSync().filter(c => !c.isActive);
    });
  }

  get sortedCases(): CaseModel[] {
    return this.sortService.sortCases(this.archivedCases, this.sortOption);
  }

  onSortChange(option: SortOption) {
    this.sortOption = option;
  }

  viewCase(caseModel: CaseModel) {
    this.selectedCase = caseModel;
  }

  closeCase() {
    this.selectedCase = null;
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'sos':
        return 'priority-sos';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  }

  goBack() {
    this.router.navigate(['/hospital']);
  }
}
