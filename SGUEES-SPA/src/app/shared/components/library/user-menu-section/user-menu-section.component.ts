import { Component, NgModule, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService, IUser } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'user-menu-section',
  templateUrl: 'user-menu-section.component.html',
  styleUrls: ['./user-menu-section.component.scss'],
})

export class UserMenuSectionComponent {
  @Input()
  menuItems: any;

  @Input()
  showAvatar!: boolean;

  @ViewChild('actionsContainer', { read: ElementRef }) actionsContainer?: ElementRef<HTMLElement>;

  @Input()
  user!: IUser | null;

  urlPhotoUser = 'assets/img/user.png'; //this.authService.decodedToken.URL_FOTO_PERFIL;
  nameUser = this.authService.decodedToken?.unique_name ?? 'Usuario';
  loginUser = this.authService.decodedToken?.nameid ?? '';

  constructor(private authService: AuthService) {}

  handleActionClick(item: { onClick?: () => void }) {
    item?.onClick?.();
  }

  focusFirstAction(): void {
    const firstButton = this.actionsContainer?.nativeElement?.querySelector('button');
    (firstButton as HTMLButtonElement | undefined)?.focus();
  }
}

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [UserMenuSectionComponent],
  exports: [UserMenuSectionComponent],
})
export class UserMenuSectionModule { }
