import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PuedeDesactivar {
  permitirSalir: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppCanDeactivateGuard implements CanDeactivate<PuedeDesactivar> {

  canDeactivate(component: PuedeDesactivar) {
    return component.permitirSalir ? component.permitirSalir() : true;
  }

}
