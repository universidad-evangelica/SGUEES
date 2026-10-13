import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { Subject, takeUntil } from 'rxjs';
import { GenNotificacionService, GenNotificacionItem } from 'src/app/services/gen-notificacion.service';
import {
  NotificationMessageDto,
  NotificationSignalRService,
} from 'src/app/services/notification-signalr.service';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  items: GenNotificacionItem[] = [];
  pendientes = 0;
  loading = false;
  errorMsg = '';
  panelVisible = false;

  private readonly destroy$ = new Subject<void>();
  private readonly pageSize = 20;
  private syncInFlight = false;

  constructor(
    private api: GenNotificacionService,
    private signalR: NotificationSignalRService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sincronizarDesdeApi();

    this.signalR.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((n) => this.onSignalRNotification(n));

    this.signalR.reconnected$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.sincronizarDesdeApi());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get badgeText(): string {
    if (this.pendientes <= 0) {
      return '';
    }
    return this.pendientes > 99 ? '99+' : String(this.pendientes);
  }

  togglePanel(): void {
    this.panelVisible = !this.panelVisible;
    if (this.panelVisible) {
      this.sincronizarDesdeApi();
    }
  }

  onPanelHiding(): void {
    this.panelVisible = false;
  }

  async onItemClick(item: GenNotificacionItem): Promise<void> {
    if (!item) {
      return;
    }

    if (!item.LEIDA && item.CORR_NOTIFICACION) {
      await this.marcarLeidaLocal(item);
    }

    const url = (item.URL_DESTINO || '').trim();
    if (this.esUrlInternaValida(url)) {
      this.panelVisible = false;
      void this.router.navigateByUrl(url);
    }
  }

  trackByNotif(_: number, item: GenNotificacionItem): string {
    return `${item.CORR_EMPRESA ?? 0}-${item.CORR_NOTIFICACION ?? 0}`;
  }

  private sincronizarDesdeApi(): void {
    if (this.syncInFlight) {
      return;
    }
    this.syncInFlight = true;
    this.loading = true;
    this.errorMsg = '';

    let pendingDone = false;
    let listDone = false;
    const finish = () => {
      if (pendingDone && listDone) {
        this.syncInFlight = false;
        this.loading = false;
      }
    };

    this.api
      .countPendientes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res?.Result) {
            this.pendientes = Number(res.Data ?? 0) || 0;
          }
          pendingDone = true;
          finish();
        },
        error: () => {
          this.errorMsg = 'No se pudo actualizar el contador.';
          pendingDone = true;
          finish();
        },
      });

    this.api
      .getRecientes(this.pageSize, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res?.Result && Array.isArray(res.Data)) {
            this.items = res.Data as GenNotificacionItem[];
            if (!this.errorMsg) {
              this.errorMsg = '';
            }
          } else {
            this.errorMsg = res?.ErrorMessage || 'No se pudieron cargar las notificaciones.';
          }
          listDone = true;
          finish();
        },
        error: () => {
          this.errorMsg = 'Error al cargar notificaciones.';
          listDone = true;
          finish();
        },
      });
  }

  private onSignalRNotification(n: NotificationMessageDto): void {
    const corrEmpresa = Number(n?.CORR_EMPRESA);
    const corrNotif = Number(n?.CORR_NOTIFICACION);
    if (!Number.isFinite(corrEmpresa) || corrEmpresa <= 0 || !Number.isFinite(corrNotif) || corrNotif <= 0) {
      return;
    }

    const normalized: GenNotificacionItem = {
      ...n,
      CORR_EMPRESA: corrEmpresa,
      CORR_NOTIFICACION: corrNotif,
      LEIDA: !!n.LEIDA,
    };

    const idx = this.items.findIndex(
      (x) => Number(x.CORR_EMPRESA) === corrEmpresa && Number(x.CORR_NOTIFICACION) === corrNotif
    );

    const wasNew = idx < 0;
    if (idx >= 0) {
      this.items[idx] = { ...this.items[idx], ...normalized };
    } else {
      this.items = [normalized, ...this.items].slice(0, this.pageSize);
    }

    if (wasNew && !normalized.LEIDA) {
      this.pendientes += 1;
    }
  }

  private marcarLeidaLocal(item: GenNotificacionItem): Promise<void> {
    const corr = Number(item.CORR_NOTIFICACION);
    if (!corr) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.api
        .marcarLeida(corr)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res?.Result) {
              const updated = (res.Data as GenNotificacionItem) || { ...item, LEIDA: true };
              const idx = this.items.findIndex(
                (x) =>
                  x.CORR_EMPRESA === (updated.CORR_EMPRESA ?? item.CORR_EMPRESA) &&
                  x.CORR_NOTIFICACION === (updated.CORR_NOTIFICACION ?? item.CORR_NOTIFICACION)
              );
              if (idx >= 0) {
                const eraNoLeida = !this.items[idx].LEIDA;
                this.items[idx] = { ...this.items[idx], ...updated, LEIDA: true };
                if (eraNoLeida && this.pendientes > 0) {
                  this.pendientes -= 1;
                }
              }
              // Contador real desde API tras marcar leída.
              this.api
                .countPendientes()
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (c) => {
                    if (c?.Result) {
                      this.pendientes = Number(c.Data ?? 0) || 0;
                    }
                  },
                });
            } else {
              this.sincronizarDesdeApi();
            }
            resolve();
          },
          error: () => {
            this.sincronizarDesdeApi();
            resolve();
          },
        });
    });
  }

  private esUrlInternaValida(url: string): boolean {
    if (!url) {
      return false;
    }
    const lower = url.toLowerCase();
    if (
      lower.startsWith('http:') ||
      lower.startsWith('https:') ||
      lower.startsWith('javascript:') ||
      lower.startsWith('//')
    ) {
      return false;
    }
    return url.startsWith('/');
  }
}

@NgModule({
  imports: [CommonModule, DxButtonModule, DxPopoverModule, DxScrollViewModule, DxLoadIndicatorModule],
  declarations: [NotificationBellComponent],
  exports: [NotificationBellComponent],
})
export class NotificationBellModule {}
