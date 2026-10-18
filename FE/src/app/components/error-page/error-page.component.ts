import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent {

  constructor(private router: Router) {}

  goToLogin(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('loggedIn');
    this.router.navigate(['/']);
  }
}
