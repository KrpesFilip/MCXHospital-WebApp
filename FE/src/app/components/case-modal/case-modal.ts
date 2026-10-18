import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Case, CreateCaseDTO } from '../../models/case.model';
import { CaseService } from '../../services/case.service';

@Component({
  selector: 'app-case-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-modal.html',
  styleUrl: './case-modal.scss'
})
export class CaseModal implements OnChanges {
  @Input() isOpen = false;
  @Input() editMode = false;
  @Input() existingCase: Case | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() caseCreated = new EventEmitter<Case>();
  @Output() caseUpdated = new EventEmitter<Case>();

  originalCaseData: any = null;

  currentStep = 1;

  caseData: any = {
    patientName: '',
    birthYear: 1980,
    sex: 'M',
    symptoms: '', 
    quickSymptoms: [], 
    
    heartRateLabel: 'normal',
    respiratoryRateLabel: 'normal',
    oxygenSaturationLabel: 'normal',
    
    bpm: 80,
    systolicPressure: 120,
    diastolicPressure: 80,
    resRate: 16,
    saturation: 98,
    temperature: 37,
  };

  quickSymptomOptions = [
    'Chest pain',
    'Difficulty breathing',
    'Loss of consciousness',
    'Severe bleeding'
  ];

  heartRateOptions = [
    { value: 'very-low', label: 'Very Low', range: '<40 bpm', color: '#3b82f6', bpm: 35 },
    { value: 'low', label: 'Low', range: '40-60 bpm', color: '#60a5fa', bpm: 50 },
    { value: 'normal', label: 'Normal', range: '60-100 bpm', color: '#22c55e', bpm: 80 },
    { value: 'high', label: 'High', range: '100-120 bpm', color: '#f97316', bpm: 110 },
    { value: 'very-high', label: 'Very High', range: '>120 bpm', color: '#ef4444', bpm: 130 }
  ];

  respiratoryRateOptions = [
    { value: 'very-low', label: 'Very Low', range: '<8 br/min', color: '#3b82f6', resRate: 6 },
    { value: 'low', label: 'Low', range: '8-12 br/min', color: '#60a5fa', resRate: 10 },
    { value: 'normal', label: 'Normal', range: '12-20 br/min', color: '#22c55e', resRate: 16 },
    { value: 'high', label: 'High', range: '20-30 br/min', color: '#f97316', resRate: 25 },
    { value: 'very-high', label: 'Very High', range: '>30 br/min', color: '#ef4444', resRate: 35 }
  ];

  oxygenSaturationOptions = [
    { value: 'critical', label: 'Critical', range: '<90%', color: '#ef4444', saturation: 85 },
    { value: 'low', label: 'Low', range: '90-94%', color: '#f97316', saturation: 92 },
    { value: 'normal', label: 'Normal', range: '95-100%', color: '#22c55e', saturation: 98 }
  ];

  defaultLocation = { 
    latitude: 45.815399,
    longitude: 15.966568
  }

  isLoading = false;

  constructor(private caseService: CaseService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      if (this.editMode && this.existingCase) {
        console.log('📝 Edit mode: Loading existing case');
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

    const quickSymptomsFromDescription = this.extractQuickSymptoms(this.existingCase.description);
 
    this.caseData = {
      patientName: this.existingCase.patientName,
      birthYear: this.existingCase.birthYear,
      sex: this.existingCase.sex,
      symptoms: this.getDescriptionWithoutQuickSymptoms(this.existingCase.description, quickSymptomsFromDescription),
      quickSymptoms: quickSymptomsFromDescription,
      heartRateLabel: this.getHeartRateLabel(this.existingCase.bpm),
      respiratoryRateLabel: this.getRespiratoryRateLabel(this.existingCase.resRate),
      oxygenSaturationLabel: this.getOxygenSaturationLabel(this.existingCase.saturation),
      bpm: this.existingCase.bpm,
      systolicPressure: this.existingCase.systolicPressure,
      diastolicPressure: this.existingCase.diastolicPressure,
      resRate: this.existingCase.resRate,
      saturation: this.existingCase.saturation,
      temperature: this.existingCase.temperature,
    };
    
    this.originalCaseData = JSON.parse(JSON.stringify(this.caseData));
  }

  extractQuickSymptoms(description: string): string[] {
    if (!description) return [];
    
    const foundSymptoms: string[] = [];
    
    this.quickSymptomOptions.forEach(symptom => {
      if (description.includes(symptom)) {
        foundSymptoms.push(symptom);
      }
    });
    
    return foundSymptoms;
  }

  getDescriptionWithoutQuickSymptoms(description: string, quickSymptoms: string[]): string {
    if (!description || quickSymptoms.length === 0) return description;
    
    let cleanedDescription = description;
    
    quickSymptoms.forEach(symptom => {
      cleanedDescription = cleanedDescription.replace(symptom, '').trim();
    });
    
    cleanedDescription = cleanedDescription
      .replace(/,\s*,/g, ',') 
      .replace(/^\.\s*/, '') 
      .replace(/\.\s*\./g, '.') 
      .replace(/,\s*\./g, '.') 
      .replace(/^\s*,\s*/, '')
      .replace(/\s*,\s*$/, '')
      .trim();
    
    return cleanedDescription;
  }


  calculateAge(): number {
    const currentYear = new Date().getFullYear();
    return currentYear - this.caseData.birthYear!;
  }

  isSymptomSelected(symptom: string): boolean {
    return this.caseData.quickSymptoms?.includes(symptom) || false;
  }

  toggleQuickSymptom(symptom: string): void {
    if (!this.caseData.quickSymptoms) {
      this.caseData.quickSymptoms = [];
    }
    
    const index = this.caseData.quickSymptoms.indexOf(symptom);
    if (index > -1) {
      this.caseData.quickSymptoms.splice(index, 1);
    } else {
      this.caseData.quickSymptoms.push(symptom);
    }
  }

  selectHeartRate(value: string): void {
    this.caseData.heartRateLabel = value;
    const option = this.heartRateOptions.find(opt => opt.value === value);
    if (option) {
      this.caseData.bpm = option.bpm;
    }
  }

  selectRespiratoryRate(value: string): void {
    this.caseData.respiratoryRateLabel = value;
    const option = this.respiratoryRateOptions.find(opt => opt.value === value);
    if (option) {
      this.caseData.resRate = option.resRate;
    }
  }

  selectOxygenSaturation(value: string): void {
    this.caseData.oxygenSaturationLabel = value;
    const option = this.oxygenSaturationOptions.find(opt => opt.value === value);
    if (option) {
      this.caseData.saturation = option.saturation;
    }
  }

  canProceed(): boolean {
    if (this.currentStep === 1) {
      return !!this.caseData.patientName && !!this.caseData.sex;
    }
    if (this.currentStep === 2) {
      return !!this.caseData.symptoms || (this.caseData.quickSymptoms?.length || 0) > 0;
    }
    return true;
  }

  nextStep(): void {
    if (this.canProceed() && this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  createCase(): void {
    if (this.editMode && !this.hasDataChanged()) {
      console.log('No changes detected, closing modal');
      this.closeModal();
      return;
    }

    this.isLoading = true;

    let fullDescription = this.caseData.symptoms ? this.caseData.symptoms.trim() : '';
  
    if (this.caseData.quickSymptoms && this.caseData.quickSymptoms.length > 0) {
      const quickSymptomsText = this.caseData.quickSymptoms.join(', ');
      
      if (fullDescription) {
        if (!fullDescription.endsWith('.')) {
          fullDescription += '.'; 
        }
        fullDescription += ' ' + quickSymptomsText;
      } else {
        fullDescription = quickSymptomsText;
      }
    }
    
    // Create DTO
    const caseDTO: CreateCaseDTO = {
      patientName: this.caseData.patientName,
      birthYear: this.caseData.birthYear,
      sex: this.caseData.sex,
      description: fullDescription,
      bpm: this.caseData.bpm,
      systolicPressure: this.caseData.systolicPressure,
      diastolicPressure: this.caseData.diastolicPressure,
      resRate: this.caseData.resRate,
      saturation: this.caseData.saturation,
      temperature: this.caseData.temperature,
      latitude: 0,  // Placeholder, will be set after geolocation
      longitude: 0  // Placeholder, will be set after geolocation
    };

    if (this.editMode && this.existingCase) {
      caseDTO.latitude = this.existingCase.latitude;
      caseDTO.longitude = this.existingCase.longitude;
      this.submitCase(caseDTO, fullDescription);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          caseDTO.latitude = position.coords.latitude;
          caseDTO.longitude = position.coords.longitude;
          this.submitCase(caseDTO, fullDescription);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to default location if geolocation fails
          caseDTO.latitude = this.defaultLocation.latitude;
          caseDTO.longitude = this.defaultLocation.longitude;
          this.submitCase(caseDTO, fullDescription);
        }
      );
    } else {
      console.warn('Geolocation not supported');
      caseDTO.latitude = this.defaultLocation.latitude;
      caseDTO.longitude = this.defaultLocation.longitude;
      this.submitCase(caseDTO, fullDescription);
    }
  }

  submitCase(caseDTO: CreateCaseDTO, fullDescription: string): void {
    const request = this.editMode && this.existingCase
      ? this.caseService.updateRegularCase(this.existingCase.id, caseDTO)
      : this.caseService.createRegularCase(caseDTO);

    request.subscribe({
      next: (response) => {
        
        this.caseService.getCaseById(response.id).subscribe({
          next: (fullCase) => {            
            const caseToEmit: Case = this.mapBackendResponseToCase(fullCase);
            
            if (this.editMode) {
              this.caseUpdated.emit(caseToEmit);
            } else {
              this.caseCreated.emit(caseToEmit);
            }
            localStorage.setItem('newCaseId', caseToEmit.id.toString());
            this.isLoading = false;
            this.closeModal();
          },
          error: (error) => {
            alert('Case created but failed to fetch details.');
            this.isLoading = false;
            this.closeModal();
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error);
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
      bpm: backendCase.bpm,
      systolicPressure: backendCase.systolicPressure,
      diastolicPressure: backendCase.diastolicPressure,
      resRate: backendCase.resRate,
      saturation: backendCase.saturation,
      temperature: backendCase.temperature,
      latitude: backendCase.latitude,
      longitude: backendCase.longitude,
      priority: backendCase.priority,
      
      isSos: backendCase.isSos || false,
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
    if (backendCase.acknowledged) return 'sent';
    return 'active';
  }

  private handleError(error: any): void {
    let errorMessage = (this.editMode ? 'Failed to update case. ' : 'Failed to create case. ');
    
    if (error.status === 0) {
      errorMessage += 'Cannot connect to server. Is backend running?';
    } else if (error.status === 401 || error.status === 403) {
      errorMessage += 'Authentication required.';
    } else if (error.status === 400) {
      errorMessage += 'Invalid data.\n';
      if (error.error?.message) {
        errorMessage += 'Details: ' + error.error.message;
      }
    } else if (error.status === 500) {
      errorMessage += 'Server error.';
    } else {
      errorMessage += error.error?.message || error.message || 'Unknown error';
    }
    
    alert(errorMessage);
  }

  closeModal(): void {
    this.isOpen = false;
    this.currentStep = 1;
    this.close.emit();
  }

  resetForm(): void {
    this.caseData = {
      patientName: '',
      birthYear: 1980,
      sex: 'M',
      symptoms: '',
      quickSymptoms: [],
      heartRateLabel: 'normal',
      respiratoryRateLabel: 'normal',
      oxygenSaturationLabel: 'normal',
      bpm: 80,
      systolicPressure: 120,
      diastolicPressure: 80,
      resRate: 16,
      saturation: 98,
      temperature: 37,
    };
    this.originalCaseData = null;
  }

  getHeartRateLabel(bpm: number | undefined): string {
    if (bpm === undefined) return 'normal';
    if (bpm < 40) return 'very-low';
    if (bpm < 60) return 'low';
    if (bpm <= 100) return 'normal';
    if (bpm <= 120) return 'high';
    return 'very-high';
  }

  getRespiratoryRateLabel(resRate: number | undefined): string {
    if (resRate === undefined) return 'normal';
    if (resRate < 8) return 'very-low';
    if (resRate < 12) return 'low';
    if (resRate <= 20) return 'normal';
    if (resRate <= 30) return 'high';
    return 'very-high';
  }

  getOxygenSaturationLabel(saturation: number | undefined): string {
    if (saturation === undefined) return 'normal';
    if (saturation < 90) return 'critical';
    if (saturation < 95) return 'low';
    return 'normal';
  }

  hasDataChanged(): boolean {
    if (!this.originalCaseData) return true;
    
    const fieldsToCompare = [
      'patientName', 'birthYear', 'sex', 'symptoms',
      'bpm', 'systolicPressure', 'diastolicPressure',
      'resRate', 'saturation', 'temperature'
    ];
    
    for (const field of fieldsToCompare) {
      if (this.caseData[field] !== this.originalCaseData[field]) {
        return true;
      }
    }

    const currentQuickSymptoms = this.caseData.quickSymptoms || [];
    const originalQuickSymptoms = this.originalCaseData.quickSymptoms || [];
    
    if (currentQuickSymptoms.length !== originalQuickSymptoms.length) {
      return true;
    }
    
    for (let i = 0; i < currentQuickSymptoms.length; i++) {
      if (currentQuickSymptoms[i] !== originalQuickSymptoms[i]) {
        return true;
      }
    }

    const currentSorted = [...currentQuickSymptoms].sort();
    const originalSorted = [...originalQuickSymptoms].sort();

    for (let i = 0; i < currentSorted.length; i++) {
      if (currentSorted[i] !== originalSorted[i]) {
        return true;
      }
    }
    
    return false;
  }
}