import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { BrowserModule } from '@angular/platform-browser';
import {
  LoginFormComponent,
  ResetPasswordFormComponent,
  CreateAccountFormComponent,
  ChangePasswordFormComponent,
} from './shared/components';
import { AuthGuardService } from './shared/services';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { HomeComponent } from './pages/home/home.component';
import { PreloadService } from './shared/services/preload.service';
import { SideNavOuterToolbarComponent, UnauthenticatedContentComponent } from './layouts';

import { CrmContactListComponent } from './pages/Samples/crm-contact-list/crm-contact-list.component';
import { CrmContactDetailsComponent } from './pages/Samples/crm-contact-details/crm-contact-details.component';
import { PlanningTaskListComponent } from './pages/Samples/planning-task-list/planning-task-list.component';
import { PlanningTaskDetailsComponent } from './pages/Samples/planning-task-details/planning-task-details.component';
import { AnalyticsDashboardComponent } from './pages/Samples/analytics-dashboard/analytics-dashboard.component';
import { AnalyticsSalesReportComponent } from './pages/Samples/analytics-sales-report/analytics-sales-report.component';
import { AnalyticsGeographyComponent } from './pages/Samples/analytics-geography/analytics-geography.component';
import { PlanningSchedulerComponent } from './pages/Samples/planning-scheduler/planning-scheduler.component';
import { AppSignInComponent } from './pages/Samples/sign-in-form/sign-in-form.component';
import { AppSignUpComponent } from './pages/Samples/sign-up-form/sign-up-form.component';
import { AppResetPasswordComponent } from './pages/Samples/reset-password-form/reset-password-form.component';
import { UserProfileComponent } from './pages/Samples/user-profile/user-profile.component';

const routes: Routes = [
	{
		path: 'home',
		component: HomeComponent,
		canActivate: [AuthGuardService],
	},
	{
		path: 'login-form',
		component: LoginFormComponent,
		canActivate: [AuthGuardService],
	},
  {
    path: 'crm-contact-list',
    component: CrmContactListComponent,
  },
  {
    path: 'crm-contact-details',
    component: CrmContactDetailsComponent,
  },
  {
    path: 'planning-task-list',
    component: PlanningTaskListComponent,
  },
  {
    path: 'planning-task-details',
    component: PlanningTaskDetailsComponent
  },
  {
    path: 'planning-scheduler',
    component: PlanningSchedulerComponent
  },
  {
    path: 'analytics-dashboard',
    component: AnalyticsDashboardComponent
  },
  {
    path: 'analytics-sales-report',
    component: AnalyticsSalesReportComponent
  },
  {
    path: 'analytics-geography',
    component: AnalyticsGeographyComponent
  },
	{
		path: '**',
		redirectTo: 'home',
	},
];


/*
const routes: Routes = [
  {
    path: 'auth',
    component: UnauthenticatedContentComponent,
    children: [
      {
        path: 'login',
        component: LoginFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'reset-password',
        component: ResetPasswordFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'create-account',
        component: CreateAccountFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'change-password/:recoveryCode',
        component: ChangePasswordFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ]
  },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'crm-contact-list',
        component: CrmContactListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'crm-contact-details',
        component: CrmContactDetailsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'planning-task-list',
        component: PlanningTaskListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'planning-task-details',
        component: PlanningTaskDetailsComponent
      },
      {
        path: 'planning-scheduler',
        component: PlanningSchedulerComponent
      },
      {
        path: 'analytics-dashboard',
        component: AnalyticsDashboardComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'analytics-sales-report',
        component: AnalyticsSalesReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'analytics-geography',
        component: AnalyticsGeographyComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sign-in-form',
        component: AppSignInComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sign-up-form',
        component: AppSignUpComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'reset-password-form',
        component: AppResetPasswordComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'user-profile',
        component: UserProfileComponent
      },
      {
        path: '**',
        redirectTo: 'crm-contact-list',
        pathMatch: 'full',
      },
    ]
  },
];*/

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: false, preloadingStrategy: PreloadService })
  ],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [HomeComponent, CBaseComponent],
})
export class AppRoutingModule { }
