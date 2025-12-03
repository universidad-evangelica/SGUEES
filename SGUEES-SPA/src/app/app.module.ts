import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SideNavOuterToolbarModule, SingleCardModule } from './layouts';
import {
  AppFooterModule,
  ResetPasswordFormModule,
  CreateAccountFormModule,
  ChangePasswordFormModule,
  LoginFormModule,
} from './shared/components';

import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { UnauthenticatedContentModule } from './layouts/unauthenticated-content/unauthenticated-content';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { JwtModule } from '@auth0/angular-jwt';
import localeEs from '@angular/common/locales/es';
import { DatePipe, registerLocaleData } from '@angular/common';
import { ErrorInterceptorProvider } from './shared/services/error.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AiDemoComponent } from './components/ai-demo/ai-demo.component';
import { OptionsQaComponent } from './components/options-qa/options-qa.component';
import { SecurityModule } from './pages/Security/security.module';
import { ShopModule } from './pages/Shop/shop.module';
import { GeneralModule } from './pages/General/general.module';

import { CrmContactListModule } from './pages/Samples/crm-contact-list/crm-contact-list.component';
import { CrmContactDetailsModule } from './pages/Samples/crm-contact-details/crm-contact-details.component';
import { PlanningTaskListModule } from './pages/Samples/planning-task-list/planning-task-list.component';
import { PlanningTaskDetailsModule } from './pages/Samples/planning-task-details/planning-task-details.component';
import { AnalyticsDashboardModule } from './pages/Samples/analytics-dashboard/analytics-dashboard.component';
import { AnalyticsSalesReportModule } from './pages/Samples/analytics-sales-report/analytics-sales-report.component';
import { AnalyticsGeographyModule } from './pages/Samples/analytics-geography/analytics-geography.component';
import { ThemeService } from './shared/services';

registerLocaleData(localeEs, 'es');

export function tokenGetterLocal(): string {
	return localStorage.getItem('token') || '';
}

@NgModule({
  declarations: [
    AppComponent,
    AiDemoComponent,
    OptionsQaComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    JwtModule.forRoot({
			config: {
				tokenGetter: tokenGetterLocal,
				allowedDomains: [environment.UrlApiToken, 'localhost:5015', 'localhost:5016'],
				disallowedRoutes: [environment.UrlApiToken + '/SEG_USUARIO/login'],
			},
		}),
    SideNavOuterToolbarModule,
    SingleCardModule,
    AppFooterModule,
    ResetPasswordFormModule,
    CreateAccountFormModule,
    ChangePasswordFormModule,
    UnauthenticatedContentModule,
    LoginFormModule,

    /*CrmContactListModule,
    CrmContactDetailsModule,
    PlanningTaskListModule,
    PlanningTaskDetailsModule,
    AnalyticsDashboardModule,
    AnalyticsSalesReportModule,
    AnalyticsGeographyModule,*/
    SecurityModule,
    ShopModule,
    GeneralModule,
    AppRoutingModule,
  ],
  providers: [
    ErrorInterceptorProvider,
    DatePipe,
    AuthService,
    ScreenService,
    AppInfoService,
    ThemeService,
    { provide: LOCALE_ID, useValue: 'es' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
