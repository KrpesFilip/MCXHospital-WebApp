import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Case } from '../../models/case.model';
import { CaseService } from '../../services/case.service';

interface SosCaseDTO {
  patientName: string;
  birthYear: number;
  sex: 'M' | 'F';
  description: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-sos-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sos-modal.html',
  styleUrl: './sos-modal.scss'
})
export class SosModal implements OnChanges {
  @Input() isOpen = false;
  @Input() editMode = false;
  @Input() existingCase: Case | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() caseCreated = new EventEmitter<Case>();
  @Output() caseUpdated = new EventEmitter<Case>();

  currentStep = 1;

  isLoading = false;

  caseData = {
    patientName: '',
    birthYear: 1980,
    sex: 'M' as 'M' | 'F',
    category: ''
  };

  emergencyCategories = [
    { 
      value: 'CPR / CHOKING HAZARD', 
      label: 'CPR / CHOKING HAZARD',
      icon: '💔',
      color: '#dc2626'
    },
    { 
      value: 'STROKE', 
      label: 'STROKE',
      icon: '🧠',
      color: '#ea580c'
    },
    { 
      value: 'CARDIAC EMERGENCY', 
      label: 'CARDIAC EMERGENCY',
      icon: '💓',
      color: '#b91c1c'
    },
    { 
      value: 'SEVERE BLEEDING', 
      label: 'SEVERE BLEEDING',
      icon: '🩸',
      color: '#7f1d1d'
    },
    { 
      value: 'MAJOR TRAUMA', 
      label: 'MAJOR TRAUMA',
      icon: '💥',
      color: '#6b21a8'
    },
    { 
      value: 'BABY DELIVERY', 
      label: 'BABY DELIVERY',
      icon: '👶',
      color: '#db2777'
    }
  ];

  defaultLocation = { 
    latitude: 45.815399,
    longitude: 15.966568
  };

  constructor(private caseService: CaseService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      if (this.editMode && this.existingCase) {
        console.log('📝 Edit mode: Loading existing SOS case');
        this.loadExistingCase();
      } else {
        console.log('✨ Create mode: Resetting form');
        this.resetForm();
      }
    }
    
    if (changes['isOpen'] && !this.isOpen) {
      this.currentStep = 1;
    }
  }

  loadExistingCase(): void {
    if (!this.existingCase) return;

    this.caseData = {
      patientName: this.existingCase.patientName,
      birthYear: this.existingCase.birthYear,
      sex: this.existingCase.sex,
      category: this.existingCase.description
    };
  }

  calculateAge(): number {
    const currentYear = new Date().getFullYear();
    return currentYear - this.caseData.birthYear;
  }

  selectCategory(category: string): void {
    this.caseData.category = category;
  }

  canProceed(): boolean {
    if (this.currentStep === 1) {
      return !!this.caseData.patientName && !!this.caseData.sex;
    }
    if (this.currentStep === 2) {
      return !!this.caseData.category;
    }
    return true;
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep < 2) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  createSosCase(): void {
    this.isLoading = true;
    const sosDTO: SosCaseDTO = {
      patientName: this.caseData.patientName,
      birthYear: this.caseData.birthYear,
      sex: this.caseData.sex,
      description: this.caseData.category,
      latitude: this.existingCase?.latitude || 0,
      longitude: this.existingCase?.longitude || 0
    };

    if (this.editMode && this.existingCase) {
      // Update existing SOS case
      this.submitUpdateSosCase(sosDTO);
    } else {
      // Create new SOS case with geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            sosDTO.latitude = position.coords.latitude;
            sosDTO.longitude = position.coords.longitude;
            this.submitSosCase(sosDTO);
          },
          (error) => {
            console.warn('Geolocation error:', error);
            sosDTO.latitude = this.defaultLocation.latitude;
            sosDTO.longitude = this.defaultLocation.longitude;
            this.submitSosCase(sosDTO);
          }
        );
      } else {
        sosDTO.latitude = this.defaultLocation.latitude;
        sosDTO.longitude = this.defaultLocation.longitude;
        this.submitSosCase(sosDTO);
      }
    }
  }

  submitSosCase(sosDTO: SosCaseDTO): void {
    this.caseService.createSosCase(sosDTO).subscribe({
      next: (response) => {
        this.caseService.getCaseById(response.id).subscribe({
          next: (fullCase) => {
            const caseToEmit: Case = this.mapBackendResponseToCase(fullCase);
            this.caseCreated.emit(caseToEmit);
            this.isLoading = false;
            this.closeModal();
          },
          error: (error) => {
            console.error('Failed to fetch SOS case details:', error);
            alert('SOS Case created but failed to fetch details.');
            this.isLoading = false;
            this.closeModal();
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error, 'create');
      }
    });
  }

  submitUpdateSosCase(sosDTO: SosCaseDTO): void {
    if (!this.existingCase) return;

    this.caseService.updateSosCase(this.existingCase.id, sosDTO).subscribe({
      next: (response) => {
        this.caseService.getCaseById(response.id).subscribe({
          next: (fullCase) => {
            const caseToEmit: Case = this.mapBackendResponseToCase(fullCase);
            this.caseUpdated.emit(caseToEmit);
            this.isLoading = false;
            this.closeModal();
          },
          error: (error) => {
            console.error('Failed to fetch updated SOS case details:', error);
            alert('SOS Case updated but failed to fetch details.');
            this.isLoading = false;
            this.closeModal();
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error, 'update');
      }
    });
  }

  private mapBackendResponseToCase(backendCase: any): Case {
    return {
      id: backendCase.id,
      patientName: backendCase.patientName,
      birthYear: backendCase.birthYear,
      age: new Date().getFullYear() - backendCase.birthYear,
      sex: backendCase.sex,
      description: backendCase.description,
      bpm: backendCase.bpm || 0,
      systolicPressure: backendCase.systolicPressure || 0,
      diastolicPressure: backendCase.diastolicPressure || 0,
      resRate: backendCase.resRate || 0,
      saturation: backendCase.saturation || 0,
      temperature: backendCase.temperature || 0,
      latitude: backendCase.latitude,
      longitude: backendCase.longitude,
      priority: backendCase.priority,
      isSos: backendCase.isSos || true,
      acknowledged: backendCase.acknowledged || false,
      isActive: backendCase.isActive !== undefined ? backendCase.isActive : true,
      createdAt: backendCase.createdAt,
      createdById: backendCase.createdById,
      status: this.mapBackendStatus(backendCase),
      eta: backendCase.eta
    };
  }

  private mapBackendStatus(backendCase: any): 'active' | 'sent' | 'completed' {
    if (!backendCase.isActive) return 'completed';
    if (backendCase.acknowledged) return 'active';
    return 'sent';
  }

  private handleError(error: any, action: 'create' | 'update'): void {
    let errorMessage = `Failed to ${action} SOS case. `;
    
    if (error.status === 0) {
      errorMessage += 'Cannot connect to server. Is backend running?';
    } else if (error.status === 401 || error.status === 403) {
      errorMessage += 'Authentication required.';
    } else if (error.status === 400) {
      errorMessage += 'Invalid data.';
    } else if (error.status === 500) {
      errorMessage += 'Server error.';
    } else {
      errorMessage += error.error?.message || 'Unknown error';
    }
    
    alert(errorMessage);
  }

  closeModal(): void {
    this.isOpen = false;
    this.currentStep = 1;
    this.resetForm();
    this.close.emit();
  }

  resetForm(): void {
    this.caseData = {
      patientName: '',
      birthYear: 1980,
      sex: 'M',
      category: ''
    };
  }
}