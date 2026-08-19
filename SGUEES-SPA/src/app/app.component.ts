import { Component, HostBinding, OnDestroy, OnInit, } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppInfoService, AuthService, ScreenService, ThemeService } from './shared/services';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  jwtHelper = new JwtHelperService();
  isPublicPortal = this.resolvePublicPortal();
  private routerSub?: Subscription;

  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter((cl) => this.screen.sizes[cl]).join(' ');
  }

  constructor(private authService: AuthService,
              private themeService: ThemeService,
              private screen: ScreenService,
              private router: Router,
              public appInfo: AppInfoService) {
    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isPublicPortal = this.resolvePublicPortal();
      });
  }

  isAuthenticated() {
    return this.authService.loggedIn;
  }

  ngOnDestroy(): void {
    this.screen.breakpointSubscription.unsubscribe();
    this.routerSub?.unsubscribe();
  }

  ngOnInit(): void {
		const token = localStorage.getItem('token');
		if (token) {
			this.authService.decodedToken = this.jwtHelper.decodeToken(token);
		}
    this.isPublicPortal = this.resolvePublicPortal();
	}

  private resolvePublicPortal(): boolean {
    const path = `${this.router.url || ''} ${window.location.pathname || ''}`.split('?')[0];
    return path.includes('formulario-empleo');
  }
}
