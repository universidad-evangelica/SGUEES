import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Fase 8E — puente barra ↔ grid sin modificar HTML de CRUDs. */
export interface MttoPageContextState {
  titulo: string;
  subtitle: string;
  permiteAdd: boolean;
  showRefresh: boolean;
  unifiedToolbar: boolean;
  isBrowse: boolean;
}

const INITIAL: MttoPageContextState = {
  titulo: '',
  subtitle: '',
  permiteAdd: false,
  showRefresh: false,
  unifiedToolbar: false,
  isBrowse: true,
};

@Injectable({ providedIn: 'root' })
export class MttoPageContextService {
  private readonly state$ = new BehaviorSubject<MttoPageContextState>(INITIAL);
  private addHandler: (() => void) | null = null;
  private refreshHandler: (() => void) | null = null;

  readonly changes$ = this.state$.asObservable();

  get snapshot(): MttoPageContextState {
    return this.state$.value;
  }

  updateFromBarra(
    partial: Partial<MttoPageContextState>,
    handlers?: { add?: () => void; refresh?: () => void },
  ): void {
    this.state$.next({ ...this.state$.value, ...partial });
    if (handlers?.add) {
      this.addHandler = handlers.add;
    }
    if (handlers?.refresh) {
      this.refreshHandler = handlers.refresh;
    }
  }

  triggerAdd(): void {
    this.addHandler?.();
  }

  triggerRefresh(): void {
    this.refreshHandler?.();
  }

  reset(): void {
    this.addHandler = null;
    this.refreshHandler = null;
    this.state$.next(INITIAL);
  }
}
