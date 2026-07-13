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

import { ConReporteService } from '../con-reporte.service';
import { ConReporteDefinicion, ConReporteFiltro } from '../models/con-reporte-filtro';

@Component({
	selector: 'app-con-reporte-shell',
	templateUrl: './con-reporte-shell.component.html',
	styleUrls: ['./con-reporte-shell.component.scss'],
})
export class ConReporteShellComponent implements AfterViewInit {
	@ViewChild('gridReporte', { static: false }) gridReporte?: DxDataGridComponent;
	@ViewChild('separadorTitulo', { static: false }) separadorTitulo?: ElementRef<HTMLElement>;

	@Input() tituloVentana = '';
	@Input() codigoReporte = '';
	@Input() filtro!: ConReporteFiltro;
	@Input() definicion: ConReporteDefinicion | null = null;
	@Input() datos: unknown[] = [];
	@Input() columnas: Record<string, unknown>[] = [];
	@Input() mMeses: unknown[] = [];
	@Input() mCuentas: unknown[] = [];
	@Input() nivelCuentaMayor = 0;
	@Input() mostrarPdf = false;
	@Input() pdfUrl: SafeUrl | null = null;
	@Input() muestraGrid = false;
	@Input() muestraBotonConsultar = false;
	@Input() muestraBotonVistaPrevia = false;

	@Output() consultar = new EventEmitter<void>();
	@Output() vistaPrevia = new EventEmitter<void>();
	@Output() exportar = new EventEmitter<unknown>();

	etiquetaCuenta = (item: any) => (item ? `${item.CUENTA_CONTABLE} · ${item.NOMBRE_CUENTA}` : '');

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
		private servicioReporte: ConReporteService,
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
			(this.host.nativeElement.querySelector('.con-reporte-shell__separador-titulo') as HTMLElement | null) ??
			(this.host.nativeElement.querySelector('.con-reporte-shell__cabecera') as HTMLElement | null);
		const bordeInferior = ancla
			? ancla.getBoundingClientRect().bottom
			: this.host.nativeElement.getBoundingClientRect().top + 56;
		const margenInferior = 28;
		this.altoDrawer = Math.max(420, Math.floor(window.innerHeight - bordeInferior - margenInferior));
		this.actualizarLayoutViewport();
	}

	private actualizarLayoutViewport(): void {
		setTimeout(() => {
			this.gridReporte?.instance?.updateDimensions();
		}, 0);
	}
}
