import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user.service';
import { CaseService } from '../../services/case.service';
import { UserManagementComponent } from '../user-management/user-management.component';
import { CaseManagementComponent } from '../case-management/case-management.component';
import { Subscription } from 'rxjs';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    UserManagementComponent,
    CaseManagementComponent,
    Header
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  activeTab: 'users' | 'cases' = 'users';
  adminUsersCount = 0;
  emsUsersCount = 0;
  hospitalUsersCount = 0;
  totalUsersCount = 0;
  totalCasesCount = 0;

  private subscription: Subscription = new Subscription();

  constructor(
    public auth: AuthService,
    private userService: UserService,
    private caseService: CaseService
  ) { }

  ngOnInit() {
    //+++++++++this.userService.loadUsers();

    this.subscription.add(
      this.userService.users$.subscribe(users => {
        this.updateStats(users);
      })
    );

    // Subscribe to cases count
    this.subscription.add(
      this.caseService.cases$.subscribe(cases => {
        this.totalCasesCount = cases.length;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateStats(users: User[]) {
    this.totalUsersCount = users.length;
    this.adminUsersCount = users.filter(u => u.role === 'ADMIN').length;
    this.emsUsersCount = users.filter(u => u.role === 'VEHICLE').length;
    this.hospitalUsersCount = users.filter(u => u.role === 'HOSPITAL').length;
  }
}
