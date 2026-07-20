import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	Output,
	ViewChild,
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { BanReporteService } from '../ban-reporte.service';
import { BanReporteDefinicion, BanReporteFiltro } from '../models/ban-reporte-filtro';

@Component({
	selector: 'app-ban-reporte-shell',
	templateUrl: './ban-reporte-shell.component.html',
	styleUrls: ['./ban-reporte-shell.component.scss'],
})
export class BanReporteShellComponent implements AfterViewInit {
	@ViewChild('gridReporte', { static: false }) gridReporte?: DxDataGridComponent;
	@ViewChild('separadorTitulo', { static: false }) separadorTitulo?: ElementRef<HTMLElement>;

	@Input() tituloVentana = '';
	@Input() codigoReporte = '';
	@Input() filtro!: BanReporteFiltro;
	@Input() definicion: BanReporteDefinicion | null = null;
	@Input() datos: unknown[] = [];
	@Input() columnas: Record<string, unknown>[] = [];
	@Input() mCuentasBanco: unknown[] = [];
	@Input() mTiposMovimiento: unknown[] = [];
	@Input() mostrarPdf = false;
	@Input() pdfUrl: SafeUrl | null = null;
	@Input() muestraGrid = false;
	@Input() muestraBotonConsultar = false;
	@Input() muestraBotonVistaPrevia = false;

	@Output() consultar = new EventEmitter<void>();
	@Output() vistaPrevia = new EventEmitter<void>();
	@Output() limpiar = new EventEmitter<void>();
	@Output() exportar = new EventEmitter<unknown>();

	etiquetaCuentaBanco = (item: any) => (item ? item.NOMBRE_CUENTA_BANCO : '');

	panelFiltrosAbierto = true;
	altoDrawer = 600;
	contenidoToolbar = [
		{
			widget: 'dxButton',
			location: 'before',
			options: {
				icon: 'menu',
				onClick: () => {
					this.panelFiltrosAbierto = !this.panelFiltrosAbierto;
					setTimeout(() => this.sincronizarAltoDrawer(), 320);
				},
			},
		},
	];

	constructor(
		private host: ElementRef<HTMLElement>,
		private servicioReporte: BanReporteService
	) {}

	ngAfterViewInit(): void {
		setTimeout(() => this.sincronizarAltoDrawer());
	}

	@HostListener('window:resize')
	alRedimensionarVentana(): void {
		this.sincronizarAltoDrawer();
	}

	usaFiltro(nombreFiltro: string): boolean {
		return this.servicioReporte.usaFiltro(this.definicion, nombreFiltro);
	}

	alGridListo(): void {
		this.actualizarLayoutViewport();
	}

	alExportar(e: unknown): void {
		this.exportar.emit(e);
	}

	sincronizarAltoDrawer(): void {
		const ancla =
			this.separadorTitulo?.nativeElement ??
			(this.host.nativeElement.querySelector('.ban-reporte-shell__separador-titulo') as HTMLElement | null);
		const bordeInferior = ancla
			? ancla.getBoundingClientRect().bottom
			: this.host.nativeElement.getBoundingClientRect().top + 56;
		this.altoDrawer = Math.max(420, Math.floor(window.innerHeight - bordeInferior - 28));
		this.actualizarLayoutViewport();
	}

	private actualizarLayoutViewport(): void {
		setTimeout(() => this.gridReporte?.instance?.updateDimensions(), 0);
	}
}
