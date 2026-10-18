import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  username = '';
  password = '';
  showPassword = false;
  error = '';
  loading = false;

  constructor(private authService: AuthService) { }

  async submit(): Promise<void> {
    this.error = '';
    this.loading = true;

    try {
      const ok = await this.authService.login(this.username, this.password);
      if (!ok) {
        this.error = this.authService.getLastError() || 'Invalid username or password';
      }
    } catch (err) {
      this.error = 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}

