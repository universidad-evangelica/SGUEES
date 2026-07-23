import { Injectable } from '@angular/core';
import { BanReporteColumnaUiConfig, BanReporteUiConfig } from '../models/ban-reporte-ui.config';

@Injectable({ providedIn: 'root' })
export class BanReporteColumnaService {
	construirColumnasGrid(config: BanReporteUiConfig): Record<string, unknown>[] {
		return config.columnas
			.filter((col) => col.visible !== false)
			.map((col) => this.construirColumnaDx(col));
	}

	filtrarColumnasPorDatos(columnas: Record<string, unknown>[], filas: unknown[]): Record<string, unknown>[] {
		if (!filas?.length) {
			return columnas;
		}
		const primeraFila = filas[0] as Record<string, unknown>;
		const camposDisponibles = new Set(Object.keys(primeraFila));
		return columnas.filter((col) => camposDisponibles.has(String(col['dataField'])));
	}

	private construirColumnaDx(definicion: BanReporteColumnaUiConfig): Record<string, unknown> {
		const columna: Record<string, unknown> = {
			dataField: definicion.campo,
			caption: definicion.titulo,
			allowResizing: true,
			width: definicion.ancho,
			minWidth: definicion.ancho,
			maxWidth: definicion.ancho,
		};
		const formato = definicion.formato ?? this.inferirFormato(definicion.campo);
		if (formato === 'fecha') {
			columna['dataType'] = 'date';
			columna['format'] = 'dd/MM/yyyy';
			columna['alignment'] = definicion.alineacion ?? 'center';
		} else if (formato === 'moneda') {
			columna['dataType'] = 'number';
			columna['format'] = { type: 'fixedPoint', precision: 2 };
			columna['alignment'] = definicion.alineacion ?? 'right';
		} else {
			columna['alignment'] = definicion.alineacion ?? 'left';
		}
		return columna;
	}

	private inferirFormato(campo: string): 'texto' | 'fecha' | 'moneda' {
		if (campo.startsWith('FECHA_')) {
			return 'fecha';
		}
		if (/^(MONTO_|SALDO_|CARGO_|ABONO_)/.test(campo)) {
			return 'moneda';
		}
		return 'texto';
	}
}
