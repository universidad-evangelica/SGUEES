import { Directive, Input, TemplateRef } from '@angular/core';

/** Pestaña extra del ribbon de `app-barra-data-mtto` (opt-in desde el hijo). */
@Directive({
  selector: '[barraRibbonTabTitle]',
})
export class BarraRibbonTabDirective {
  @Input('barraRibbonTabTitle') title = '';
  @Input() barraRibbonTabVisible = true;

  constructor(public templateRef: TemplateRef<unknown>) {}
}
