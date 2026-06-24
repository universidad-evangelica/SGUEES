import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import ExcelJS from 'exceljs';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConClasePartidaService } from '../con-clase-partida/con-clase-partida.service';
import { ConCentroCostoService } from '../con-centro-costo/con-centro-costo.service';
import { ConCentroCosto } from '../con-centro-costo/models/con-centro-costo';
import { ConPartidaImportRow } from './models/con-partida-importar-excel';
import { ConPartidaImportarExcelService } from './con-partida-importar-excel.service';

@Component({
	selector: 'app-con-partida-importar-excel',
	templateUrl: './con-partida-importar-excel.component.html',
	styleUrls: ['./con-partida-importar-excel.component.scss'],
})
export class ConPartidaImportarExcelComponent extends CBaseComponent implements OnInit {
	@Input() modalMode = false;
	@Output() imported = new EventEmitter<void>();
	@Output() cancelled = new EventEmitter<void>();

	mCORR_CLASE_PARTIDA: any[] = [];
	corrClasePartida = 0;
	previewRows: (ConPartidaImportRow & { _rowId: number })[] = [];
	previewColumns: any[] = [];
	centrosCosto: ConCentroCosto[] = [];
	private nextRowId = 1;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private routerNavigate: Router,
		private service: ConPartidaImportarExcelService,
		private clasePartidaService: ConClasePartidaService,
		private centroCostoService: ConCentroCostoService
	) {
		super(appInfoService, router);
		this.previewColumns = this.service.getPreviewColumns();
	}

	ngOnInit(): void {
		this.llenaComboBox();
		this.cargarCentrosCosto();
	}

	override fillData(): any {
		return {};
	}

	llenaComboBox() {
		this.clasePartidaService
			.getAll({ CORR_CLASE_PARTIDA: 0 })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CLASE_PARTIDA = (response.Data || []).map((item: any) => ({
							Key: item.CORR_CLASE_PARTIDA,
							Value: `${item.CORR_CLASE_PARTIDA} - ${item.NOMBRE_CLASE_PARTIDA}`,
						}));
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	cargarCentrosCosto() {
		this.centroCostoService
			.getAll({ CORR_CENTRO_COSTO: 0 })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.centrosCosto = response.Data || [];
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	selectedClasePartida = (vRow: any): any => vRow[0].Key;

	canImportar(): boolean {
		return this.corrClasePartida > 0 && this.previewRows.length > 0;
	}

	async onFileSelected(e: any) {
		const file = e.value?.[0];
		if (!file) {
			return;
		}

		this.loadingVisible = true;
		try {
			const buffer = await file.arrayBuffer();
			const workbook = new ExcelJS.Workbook();
			await workbook.xlsx.load(buffer);
			const worksheet = workbook.worksheets[0];
			if (!worksheet) {
				this.notifyFx('El archivo Excel no contiene hojas de cálculo', NotifyType.Error);
				return;
			}

			this.previewRows = [];
			this.nextRowId = 1;
			const startRow = this.hasHeaderRow(worksheet) ? 2 : 1;

			worksheet.eachRow((row, rowNumber) => {
				if (rowNumber < startRow) {
					return;
				}

				const parsed = this.parseRow(row);
				if (parsed) {
					this.previewRows.push({ ...parsed, _rowId: this.nextRowId++ });
				}
			});

			if (this.previewRows.length === 0) {
				this.notifyFx('No se encontraron filas de datos en el archivo Excel', NotifyType.Error);
			}
		} catch (error: any) {
			this.notifyFx(error?.message || 'Error al leer el archivo Excel', NotifyType.Error);
		} finally {
			this.loadingVisible = false;
		}
	}

	private hasHeaderRow(worksheet: any): boolean {
		const firstRow = worksheet.getRow(1);
		const firstCell = this.getCellText(firstRow.getCell(1)).toLowerCase();
		return firstCell.includes('fecha');
	}

	private parseRow(row: any): ConPartidaImportRow | null {
		const fecha = this.parseDate(row.getCell(1).value);
		const numeroDocumento = this.getCellText(row.getCell(2));
		const cuenta = this.getCellText(row.getCell(3));
		const codigoCentro = this.getCellText(row.getCell(4));
		const concepto = this.getCellText(row.getCell(5));
		const cargo = this.parseNumber(row.getCell(6).value);
		const abono = this.parseNumber(row.getCell(7).value);

		if (!fecha && !numeroDocumento && !cuenta && !concepto && cargo === 0 && abono === 0) {
			return null;
		}

		return {
			FECHA_PARTIDA: fecha || new Date(),
			NUMERO_DOCUMENTO: numeroDocumento,
			CUENTA_CONTABLE: cuenta,
			CODIGO_CENTRO_COSTO: codigoCentro,
			CORR_CENTRO_COSTO: this.resolveCentroCosto(codigoCentro),
			NOMBRE_TRAN: concepto,
			MONTO_CARGO: cargo,
			MONTO_ABONO: abono,
		};
	}

	private getCellText(cell: any): string {
		const value = cell.value;
		if (value == null) {
			return '';
		}
		if (typeof value === 'object' && 'text' in (value as any)) {
			return String((value as any).text ?? '').trim();
		}
		if (value instanceof Date) {
			return value.toISOString();
		}
		return String(value).trim();
	}

	private parseDate(value: any): Date | null {
		if (value == null) {
			return null;
		}
		if (value instanceof Date) {
			return value;
		}
		if (typeof value === 'number') {
			const excelEpoch = new Date(Date.UTC(1899, 11, 30));
			return new Date(excelEpoch.getTime() + value * 86400000);
		}
		const parsed = new Date(String(value));
		return isNaN(parsed.getTime()) ? null : parsed;
	}

	private parseNumber(value: any): number {
		if (value == null || value === '') {
			return 0;
		}
		if (typeof value === 'number') {
			return value;
		}
		const normalized = String(value).replace(/,/g, '');
		const parsed = Number(normalized);
		return isNaN(parsed) ? 0 : parsed;
	}

	resolveCentroCosto(codigo: string): number | undefined {
		if (!codigo) {
			return undefined;
		}

		if (/^\d+$/.test(codigo)) {
			const numeric = Number(codigo);
			const byCorr = this.centrosCosto.find(c => c.CORR_CENTRO_COSTO === numeric);
			if (byCorr) {
				return byCorr.CORR_CENTRO_COSTO;
			}
			return numeric;
		}

		const normalized = codigo.trim().toUpperCase();
		const byCodigo = this.centrosCosto.find(
			c => (c.CODIGO_CENTRO_COSTO || '').trim().toUpperCase() === normalized
		);
		return byCodigo?.CORR_CENTRO_COSTO;
	}

	importar() {
		const rows = this.previewRows.map(({ _rowId, ...row }) => row);
		if (!this.service.esValido(this.corrClasePartida, rows, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		this.service
			.importar({ CORR_CLASE_PARTIDA: this.corrClasePartida, Rows: rows })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result && response.ErrorCode === 0) {
						this.notifyFx('Partidas importadas con éxito', NotifyType.Success);
						this.previewRows = [];
						if (this.modalMode) {
							this.imported.emit();
						}
					} else {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	cancelarModal(): void {
		this.cancelled.emit();
	}

	volverPartidas(): void {
		if (this.modalMode) {
			this.cancelarModal();
			return;
		}
		this.routerNavigate.navigateByUrl('/con-partida');
	}
}
