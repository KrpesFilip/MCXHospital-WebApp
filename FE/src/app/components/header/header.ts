import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  @Input() portalType: string = 'Portal';
  @Input() userRole: string = '';
  
  displayUsername: string = '';
  
  private readonly fallbackUsernames: { [key: string]: string } = {
    'VEHICLE': 'EMS-Technician-01',
    'ADMIN': 'System Administrator',
    'HOSPITAL': 'KBC Osijek'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.setDisplayUsername();
  }

  private setDisplayUsername(): void {
    const storedUsername = localStorage.getItem('userName');
    
    if (storedUsername) {
      this.displayUsername = storedUsername;
    } else {
      this.displayUsername = this.fallbackUsernames[this.userRole] || 'User';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}