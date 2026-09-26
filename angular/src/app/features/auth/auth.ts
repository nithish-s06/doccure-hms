import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SettingsService } from '../../core/services/settings/settings.service';
import { filter } from 'rxjs';

@Component({
  imports: [RouterModule],
  selector: 'app-auth',
  styleUrl: './auth.css',
  templateUrl: './auth.html',
})
export class Auth {
  base = '';
  page = '';
  authBadge = '';
  constructor(public settings:SettingsService, private router: Router){
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateRouteData(event.urlAfterRedirects);
        this.settings.sidebarHidden.next(false);
        this.settings.mobileOverlaySubject.next(false);

      });
  }
    private updateRouteData(url: string): void {
    const segments = url.split('/').filter(Boolean);

    this.base = segments[0]?.replaceAll('-', ' ') || '';
    this.page = segments[1]?.replaceAll('-', ' ') || '';
    if(this.base === 'login'){
      this.authBadge = 'Secure Login'
    }
    if(this.base === 'forgot password'){
      this.authBadge = 'Secure Recovery'
    }
    if(this.base === 'reset password'){
      this.authBadge = 'Secure Reset'
    }
    if(this.base === 'otp verification'){
      this.authBadge = 'Two-step Verification'
    }
    if(this.base === 'register'){
      this.authBadge = 'Secure Sign-up'
    }
    if(this.base === 'two factor authentication'){
      this.authBadge = 'Two-factor auth'
    }
    if(this.base === 'lock screen'){
      this.authBadge = 'Session Locked'
    }
    if(this.base === 'session expired'){
      this.authBadge = 'Session Timed Out'
    }
  }
  currentTheme: 'dark' | 'light' = 'light';

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.settings.changeThemeColor(this.currentTheme);
  }
}
