import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import {
	ConCatalogoCuentaImportRow,
	ConCentroCostoImportRow,
} from './models/con-contabilidad-importar-excel';
import { ConContabilidadImportarExcelService } from './con-contabilidad-importar-excel.service';
import { parseClassWebWorkbook } from './class-web-excel.parser';

@Component({
	selector: 'app-con-contabilidad-importar-excel',
	templateUrl: './con-contabilidad-importar-excel.component.html',
	styleUrls: ['./con-contabilidad-importar-excel.component.scss'],
})
export class ConContabilidadImportarExcelComponent extends CBaseComponent implements OnInit {
	cuentaRows: (ConCatalogoCuentaImportRow & { _rowId: number })[] = [];
	centroRows: (ConCentroCostoImportRow & { _rowId: number })[] = [];
	cuentaColumns: any[] = [];
	centroColumns: any[] = [];
	activeTab = 0;
	private nextRowId = 1;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private routerNavigate: Router,
		private service: ConContabilidadImportarExcelService
	) {
		super(appInfoService, router);
		this.cuentaColumns = this.service.getCuentaPreviewColumns();
		this.centroColumns = this.service.getCentroPreviewColumns();
	}

	ngOnInit(): void {}

	override fillData(): any {
		return {};
	}

	canImportar(): boolean {
		return this.cuentaRows.length > 0 || this.centroRows.length > 0;
	}

	async onFileSelected(e: any) {
		const file = e.value?.[0];
		if (!file) {
			return;
		}

		this.loadingVisible = true;
		this.cuentaRows = [];
		this.centroRows = [];
		this.nextRowId = 1;

		try {
			const buffer = await file.arrayBuffer();
			const parsed = parseClassWebWorkbook(buffer);
			this.cuentaRows = parsed.cuentaRows.map((row) => ({ ...row, _rowId: this.nextRowId++ }));
			this.centroRows = parsed.centroRows.map((row) => ({ ...row, _rowId: this.nextRowId++ }));

			if (!this.cuentaRows.length && !this.centroRows.length) {
				this.notifyFx('No se encontraron filas válidas. Revise hojas CATALOGO DE CUENTAS / Centros.', NotifyType.Warning);
			} else {
				this.activeTab = this.cuentaRows.length ? 0 : 1;
				this.notifyFx(
					`Leídas ${this.cuentaRows.length} cuenta(s) y ${this.centroRows.length} centro(s) de costo (CLASS_WEB normalizado)`,
					NotifyType.Success
				);
			}
		} catch (error: any) {
			this.notifyFx(error?.message || 'Error al leer el archivo Excel', NotifyType.Error);
		} finally {
			this.loadingVisible = false;
		}
	}

	importar() {
		if (!this.canImportar()) {
			return;
		}

		this.loadingVisible = true;
		const tasks: Promise<void>[] = [];

		if (this.cuentaRows.length) {
			tasks.push(
				new Promise((resolve, reject) => {
					this.service
						.importarCuentas({ Rows: this.cuentaRows.map(({ _rowId, ...row }) => row) })
						.pipe(take(1))
						.subscribe({
							next: (response: any) => {
								if (response?.Result) {
									this.notifyFx(`Cuentas importadas: ${response.RowsAffected ?? response.Data ?? 0}`, NotifyType.Success);
									resolve();
								} else {
									reject(response?.ErrorMessage || 'Error al importar cuentas');
								}
							},
							error: (error: any) => reject(error),
						});
				})
			);
		}

		if (this.centroRows.length) {
			tasks.push(
				new Promise((resolve, reject) => {
					this.service
						.importarCentros({ Rows: this.centroRows.map(({ _rowId, ...row }) => row) })
						.pipe(take(1))
						.subscribe({
							next: (response: any) => {
								if (response?.Result) {
									this.notifyFx(`Centros importados: ${response.RowsAffected ?? response.Data ?? 0}`, NotifyType.Success);
									resolve();
								} else {
									reject(response?.ErrorMessage || 'Error al importar centros');
								}
							},
							error: (error: any) => reject(error),
						});
				})
			);
		}

		Promise.all(tasks)
			.then(() => {
				this.loadingVisible = false;
				this.routerNavigate.navigate(['/con-catalogo-cuenta-centro-costo']);
			})
			.catch((error: any) => {
				this.loadingVisible = false;
				this.notifyFx(typeof error === 'string' ? error : error?.message || error, NotifyType.Error);
			});
	}

	volver() {
		this.routerNavigate.navigate(['/con-catalogo-cuenta-centro-costo']);
	}
}
