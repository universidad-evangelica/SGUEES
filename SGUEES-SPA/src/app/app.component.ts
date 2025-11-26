import { Component, HostBinding, OnDestroy, OnInit, } from '@angular/core';
import { AppInfoService, AuthService, ScreenService, ThemeService } from './shared/services';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  jwtHelper = new JwtHelperService();

  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter((cl) => this.screen.sizes[cl]).join(' ');
  }

  constructor(private authService: AuthService,
              private themeService: ThemeService,
              private screen: ScreenService,
              public appInfo: AppInfoService) {
    themeService.setAppTheme();
  }

  isAuthenticated() {
    return this.authService.loggedIn;
  }

  ngOnDestroy(): void {
    this.screen.breakpointSubscription.unsubscribe();
  }

  ngOnInit(): void {
		const token = localStorage.getItem('token');
		if (token) {
			this.authService.decodedToken = this.jwtHelper.decodeToken(token);
		}
	}
}
