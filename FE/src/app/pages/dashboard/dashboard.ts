import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { CaseModal } from '../../components/case-modal/case-modal';
import { SosModal } from '../../components/sos-modal/sos-modal';
import { EndCaseModal } from '../../components/end-case-modal/end-case-modal';
import { Case } from '../../models/case.model';
import { WebSocketService, LocationMessage } from '../../services/websocket.service';
import { CaseService } from '../../services/case.service';
import { GeolocationService } from '../../services/geolocation.service';
import { Message, MessageWebSocketService } from '../../hospital-services/message-ws.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Header, Sidebar, CaseModal, SosModal, EndCaseModal, CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, OnDestroy {
  @ViewChild('chatScroll') chatScroll?: ElementRef<HTMLDivElement>;
  
  
  activeCase: Case | null = null;
  messageText = '';
  isModalOpen = false;
  isSosModalOpen = false;
  isEndCaseModalOpen = false;
  isEditMode = false;
  isLoading = true;

  private authService = inject(AuthService);
  private messageWsService: MessageWebSocketService = inject(MessageWebSocketService);
  private messageSub?: Subscription;

  messages: Message[] = [];
  currentUserId: number = this.authService.getUserId();
  currentUser = {
    id: this.authService.getUserId(),
    name: this.authService.getUserName(),
    role: this.authService.getUserRole()
  };

  private wsSubscription: Subscription | null = null;

  constructor(
    private webSocketService: WebSocketService,
    private caseService: CaseService,
    private geolocationService: GeolocationService
  ) {}



  ngOnInit(): void {
    this.wsSubscription = this.webSocketService.connect().subscribe(
      (message: LocationMessage) => this.handleWebSocketMessage(message)
    );
    this.messageSub = this.messageWsService.messages$.subscribe((messages: Message[]) => {
      this.messages = messages;
       setTimeout(() => this.scrollChatToBottom(), 100);
    });

    this.caseService.getActiveCaseByUser(this.currentUserId).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.activeCase = response.length > 0 ? response[0] : null;
        } else {
          this.activeCase = response || null;
        }
        if (this.activeCase) {
          this.messageWsService.connect(this.activeCase.id, this.currentUserId);
          this.startLocationTracking();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.geolocationService.stopTracking();
    this.webSocketService.disconnect();
  }

  private handleWebSocketMessage(message: LocationMessage): void {
    const { type, data } = message;

    if (type === 'LOCATION_UPDATE') {
      return;
    }

    if (this.activeCase && data?.id === this.activeCase.id) {
      switch (type) {
        case 'CREATE':
          this.activeCase = data;
          this.startLocationTracking();
          break;
        case 'ACKNOWLEDGE':
          this.activeCase = { ...this.activeCase, acknowledged: data.acknowledged };
          break;
        case 'UPDATE':
          this.activeCase = data;
          break;
        case 'END':
          this.stopLocationTracking();
          this.activeCase = null;
          this.messageWsService.disconnect();
          this.messages = [];
          break;
      }
    } else if (type === 'CREATE' && !this.activeCase) {
      this.activeCase = data;
      this.startLocationTracking();
      this.messageWsService.connect(data.id, this.currentUserId);
    }
  }

  private startLocationTracking(): void {
    if (this.activeCase && !this.geolocationService.isTracking()) {
      this.geolocationService.startTracking(this.activeCase.id);
    }
  }

  private stopLocationTracking(): void {
    this.geolocationService.stopTracking();
  }

  openCaseModal(): void {
    this.isEditMode = false;
    this.isModalOpen = true;
  }

  openSosModal(): void {
    this.isSosModalOpen = true;
  }

  updateCase(): void {
    if (this.activeCase?.isSos) {
      this.isEditMode = true;
      this.isSosModalOpen = true;
    } else {
      this.isEditMode = true;
      this.isModalOpen = true;
    }
  }

  endCase(): void {
    this.isEndCaseModalOpen = true;
  }

  confirmEndCase(): void {
    if (!this.activeCase) return;

    this.caseService.endCase(this.activeCase.id).subscribe({
      next: () => {
        this.stopLocationTracking();
        this.messageWsService.disconnect();
        this.activeCase = null;
        this.isEndCaseModalOpen = false;
        this.messages = [];
      },
      error: (error) => {
        console.error('Error ending case:', error);
        alert('Failed to end case. Please try again.');
        this.isEndCaseModalOpen = false;
      }
    });
  }

  cancelEndCase(): void {
    this.isEndCaseModalOpen = false;
  }

  closeCaseModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
  }

  closeSosModal(): void {
    this.isSosModalOpen = false;
    this.isEditMode = false;
  }

  onCaseCreated(newCase: Case): void {
    this.activeCase = newCase;
    this.startLocationTracking();
    this.messageWsService.connect(newCase.id, this.currentUserId);
  }

  onCaseUpdated(updatedCase: Case): void {
    this.activeCase = updatedCase;
  }
  
  isActive(): boolean {
    return !!this.activeCase;
  }

  isAcknowledged(): boolean {
    return this.activeCase?.acknowledged ?? false;
  }
  
  isSelfMessage(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  getSenderName(msg: Message): string {
    return msg.senderName || 'Unknown';
  }

  scrollChatToBottom() {
    const el = this.chatScroll?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  async onSend() {
    const text = this.messageText.trim();
    if (!text || !this.activeCase) return;

    try {
      await this.messageWsService.sendMessage(
        text
      );

      this.messageText = '';

      setTimeout(() => this.scrollChatToBottom(), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }
}