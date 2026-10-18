import { Routes } from '@angular/router';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { HospitalDashboardComponent } from './pages/hospital-dashboard/hospital-dashboard.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { Dashboard } from './pages/dashboard/dashboard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: LoginFormComponent },
    { path: 'admin', component: AdminPanelComponent, canActivate: [roleGuard(['ADMIN'])] },
    { path: 'ems', component: Dashboard, canActivate: [roleGuard(['VEHICLE'])] },
    { path: 'hospital', component: HospitalDashboardComponent, canActivate: [roleGuard(['HOSPITAL'])] },
    { path: 'archive', component: ArchiveComponent, canActivate: [roleGuard(['HOSPITAL'])] },
    { path: 'error', component: ErrorPageComponent },
    { path: '', component: LoginFormComponent },
    { path: '**', redirectTo: '/error' },
];
