import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Case } from '../../models/case.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Input() activeCase: Case | null = null;
  @Output() newCaseClicked = new EventEmitter<void>();
  @Output() sosClicked = new EventEmitter<void>();

  onSosClick(): void {
    this.sosClicked.emit();
  }

  onNewCaseClick(): void {
    this.newCaseClicked.emit();
  }

  getStatus(): string {
    if (!this.activeCase) return '';
    
    return this.activeCase.acknowledged ? 'ACTIVE' : 'SENT';
  }

  getPriorityClass(): string {
    if (!this.activeCase) return '';
    return `priority-${this.activeCase.priority.toLowerCase()}`;
  }

  getStatusClass(): string {
    return `status-${this.getStatus().toLowerCase()}`;
  }

  getStatusBadgeClass(): string {
    return `status-${this.getStatus().toLowerCase()}`;
  }
}