import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { take } from 'rxjs/operators';
import { FirmasDocumentoService } from './firmas-documento.service';
import { FirmaDocumento } from './models/firma-documento';

@Component({
    selector: 'app-firmas-documento',
    templateUrl: './firmas-documento.component.html',
    styleUrls: ['./firmas-documento.component.scss'],
})
// Que hace: muestra firmas/bitacora del documento.
// Como: una sola carga por cambio de tipoDocumento/idDocumento (ngOnChanges); refresh() fuerza recarga.
export class FirmasDocumentoComponent implements OnChanges {
    @Input() tipoDocumento: number;
    @Input() idDocumento: number;
    @Input() mostrarTitulo: boolean = true;

    firmas: FirmaDocumento[] = [];
    columns: any[];
    loading: boolean = false;

    constructor(private service: FirmasDocumentoService) {
        this.columns = this.service.getColumns();
    }

    // Que hace: carga firmas cuando llegan o cambian tipo/id (incluye la primera vez).
    // Como: evita doble GET; antes ngOnInit + ngOnChanges disparaban GetFirmas dos veces.
    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['tipoDocumento'] || changes['idDocumento']) && this.tipoDocumento && this.idDocumento) {
            this.cargarFirmas();
        }
    }

    cargarFirmas(): void {
        if (!this.tipoDocumento || !this.idDocumento) {
            this.firmas = [];
            return;
        }

        this.loading = true;
        this.service
            .getFirmas(this.tipoDocumento, this.idDocumento)
            .pipe(take(1))
            .subscribe({
                next: (response: any) => {
                    this.loading = false;
                    if (response.Result) {
                        this.firmas = response.Data || [];
                    } else {
                        console.warn('Error al cargar firmas:', response.ErrorMessage);
                        this.firmas = [];
                    }
                },
                error: (error: any) => {
                    this.loading = false;
                    console.error('Error al cargar firmas:', error);
                    this.firmas = [];
                },
            });
    }

    refresh(): void {
        this.cargarFirmas();
    }
}
