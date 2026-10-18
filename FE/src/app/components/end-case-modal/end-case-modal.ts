import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-end-case-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './end-case-modal.html',
  styleUrl: './end-case-modal.scss'
})
export class EndCaseModal {
  @Input() isOpen = false;
  @Input() caseName = '';
  @Input() isSos = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}