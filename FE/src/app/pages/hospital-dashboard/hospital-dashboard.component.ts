import { Component, ViewChild, inject, OnInit, computed, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseService } from '../../hospital-services/case-store.service';
import { CaseModel } from '../../hospital-models/case-model';
import { CasesOverviewComponent } from './cases-overview.component';
import { CaseDetailComponent } from './case-detail.component';
import { AuthService } from '../../services/auth.service';
import { NotificationsWebSocketService } from '../../hospital-services/notifications-ws.service';
import { Notification } from '../../hospital-models/notification-model';
import { Header } from '../../components/header/header';

type PriorityChip = { text: string; cls: string };
type StatusChip = { text: string; cls: string };

@Component({
  selector: 'app-hospital-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CasesOverviewComponent, CaseDetailComponent, Header],
  templateUrl: './hospital-dashboard.component.html',
})
export class HospitalDashboardComponent implements OnInit, OnDestroy {
  readonly store = inject(CaseService);
  readonly authService = inject(AuthService);
  private router = inject(Router);
  private sub?: Subscription;
  private caseEndedSub?: Subscription;
  public notifications: Notification[] = [];
  private notificationsWsService = inject(NotificationsWebSocketService);
  private notificationsSub?: Subscription;

  messageText = '';

  @ViewChild(CaseDetailComponent) detail?: CaseDetailComponent;

  ngOnInit() {
    this.sub = this.store.getAllCases().subscribe(cases => {
      const savedId = localStorage.getItem('hospital_selectedCaseId');
      if (savedId) {
        const id = Number(savedId);
        const found = cases.find(c => c.id === id);
        if (found) {
          this.store.selectCase(found);
          setTimeout(() => this.detail?.scrollChatToBottom(), 100);
        }
      }    
    });
    this.notificationsWsService.connect(this.authService.getUserId());

    this.notificationsSub = this.notificationsWsService.notifications$.subscribe((notifications) => {
      this.notifications = notifications;
    });

    this.caseEndedSub = this.store.caseEnded$.subscribe((endedCase) => {
      const notification: Notification = {
        senderName: 'System',
        message: `Case #${endedCase.id} - ${endedCase.patientName} has been closed. View it in Archive.`,
        createdAt: new Date().toISOString(),
        caseId: endedCase.id
      };
      this.notificationsWsService.addLocalNotification(notification);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.caseEndedSub?.unsubscribe();
    this.notificationsSub?.unsubscribe();
    this.store.selectCase(null);
  }

  selectCase(c: CaseModel) {
    this.store.selectCase(c);
    localStorage.setItem('hospital_selectedCaseId', String(c.id));
    setTimeout(() => this.detail?.scrollChatToBottom(), 0);
  }

  deselect() {
    this.store.selectCase(null);
    localStorage.removeItem('hospital_selectedCaseId');
  }

  acknowledge(caseId: number | string) {
    const id = typeof caseId === 'string' ? parseInt(caseId) : caseId;
    this.store.acknowledgeCase(id).subscribe({
      next: () => console.log(`Case #${id} potvrđen`),
      error: (err) => console.error('Error acknowledging case:', err),
    });
  }

  send(caseId: number | string) {
    const text = this.messageText.trim();
    if (!text) return;

    console.log(`Message sent to case #${caseId}: ${text}`);

    this.messageText = '';
    setTimeout(() => this.detail?.scrollChatToBottom(), 0);
  }

  isActive(c: CaseModel): boolean {
    return c.status !== 'CLOSED';
  }

  priorityChip(p: CaseModel['priority']): PriorityChip {
    switch (p) {
      case 'HIGH':
        return {
          text: 'VISOKO',
          cls: 'bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] border border-[color:var(--border)]'
        };
      case 'MEDIUM':
        return {
          text: 'SREDNJE',
          cls: 'bg-[color:var(--muted)] text-[color:var(--foreground)] border border-[color:var(--border)]'
        };
      default:
        return {
          text: 'NISKO',
          cls: 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)] border border-[color:var(--border)]'
        };
    }
  }

  statusChip(s: CaseModel['status'] | undefined): StatusChip {
    switch (s) {
      case 'SENT':
        return {
          text: 'Poslano',
          cls: 'bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] border border-[color:var(--border)]'
        };
      case 'ACKNOWLEDGED':
        return {
          text: 'Potvrđeno',
          cls: 'bg-[color:var(--accent)] text-[color:var(--accent-foreground)] border border-[color:var(--border)]'
        };
      case 'CLOSED':
        return {
          text: 'Zatvoreno',
          cls: 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)] border border-[color:var(--border)]'
        };
      default:
        return {
          text: 'Draft',
          cls: 'bg-[color:var(--muted)] text-[color:var(--muted-foreground)] border border-[color:var(--border)]'
        };
    }
  }
  openCase(notification: Notification) {
    this.removeNotification(notification);
    
    // Check if it's a system notification for closed case
    if (notification.senderName === 'System' && notification.message.includes('has been closed')) {
      this.router.navigate(['/archive']);
      return;
    }

    // Otherwise open the active case
    const caseId = Number(notification.caseId);
    const selectedCase = this.store.cases().find(c => c.id === caseId);
    if (selectedCase) {
      this.selectCase(selectedCase);
    }
  }
  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter(n => n !== notification);
  }
}