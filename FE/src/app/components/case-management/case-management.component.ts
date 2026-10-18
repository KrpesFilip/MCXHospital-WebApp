import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayModalComponent } from '../overlay-modal/overlay-modal.component';
import { CaseService } from '../../services/case.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-case-management',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModalComponent],
  templateUrl: './case-management.component.html',
  styleUrl: './case-management.component.scss'
})
export class CaseManagementComponent implements OnInit, OnDestroy {

  selectedCase: any = null;
  showDeleteConfirmation: boolean = false;
  caseToDelete: any = null;
  cases: any[] = [];
  filteredCases: any[] = [];

  /** FILTERS */
  searchTerm: string = '';
  sosFilter: 'ALL' | 'SOS' | 'NON_SOS' = 'ALL';

  currentYear: number = new Date().getFullYear();
  private subscription: Subscription = new Subscription();

  constructor(private caseService: CaseService, private configService: ConfigService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.caseService.cases$.subscribe(cases => {
        this.cases = cases;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openCase(c: any) {
    this.selectedCase = c;
  }

  generatePdf(caseData: any): void {
  this.configService.getConfig().subscribe(config => {
    const pdfUrl = `${config.Urls.apiUrl}/cases/${caseData.id}/pdf`;
    window.open(pdfUrl, '_blank');
  });
}

  closeCase() {
    this.selectedCase = null;
  }

  /* deleteCase(c: any) {
     this.caseToDelete = c;
     this.showDeleteConfirmation = true;
   }
 
   confirmDelete() {
     if (this.caseToDelete) {
       this.caseService.deleteCase(this.caseToDelete.id).subscribe({
         next: () => {
           this.caseToDelete = null;
           this.showDeleteConfirmation = false;
           this.selectedCase = null;
         },
         error: (error) => {
           console.error('Error deleting case:', error);
           this.showDeleteConfirmation = false;
         }
       });
     } else {
       this.showDeleteConfirmation = false;
     }
   }
 
   cancelDelete() {
     this.caseToDelete = null;
     this.showDeleteConfirmation = false;
   }
 */
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

  /* -------------------------
     FILTERS
  -------------------------- */

  applyFilters(): void {
    this.filteredCases = this.cases.filter(c => {
      const matchesSearch = c.patientName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesSos =
        this.sosFilter === 'ALL' ||
        (this.sosFilter === 'SOS' && c.isSos) ||
        (this.sosFilter === 'NON_SOS' && !c.isSos);
      return matchesSearch && matchesSos;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSosFilterChange(): void {
    this.applyFilters();
  }
}
