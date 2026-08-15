import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { take } from 'rxjs/operators';
import { FirmasDocumentoService } from './firmas-documento.service';
import { FirmaDocumento } from './models/firma-documento';

@Component({
    selector: 'app-firmas-documento',
    templateUrl: './firmas-documento.component.html',
    styleUrls: ['./firmas-documento.component.scss'],
})
export class FirmasDocumentoComponent implements OnInit, OnChanges {
    @Input() tipoDocumento: number;
    @Input() idDocumento: number;
    @Input() mostrarTitulo: boolean = true;

    firmas: FirmaDocumento[] = [];
    columns: any[];
    loading: boolean = false;

    constructor(private service: FirmasDocumentoService) {
        this.columns = this.service.getColumns();
    }

    ngOnInit(): void {
        this.cargarFirmas();
    }

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
