import { Routes } from '@angular/router';
import { LayoutComponent} from './layout/layout.component';
import { RoleGuard } from '../_guards/role-guard.service';
import { HomeComponent } from './home/home.component'; 
import { CoursesComponent } from './courses/courses.component';
import { SessionsComponent } from './sessions/sessions.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from '../_guards/auth-guard.service';


export const memberRoutes: Routes = [
  {
    path: 'member',
    component: LayoutComponent,
    data: {role: 'member'},
    canActivate: [RoleGuard, AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full'},
      { path: 'home', component: HomeComponent},
      { path: 'courses', component: CoursesComponent},
      { path: 'sessions', component: SessionsComponent},
      { path: 'profile', component: ProfileComponent}
    ]
  }
];