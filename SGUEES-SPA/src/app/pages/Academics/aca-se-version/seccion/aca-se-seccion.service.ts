// Qué hace: servicio de negocio de secciones SE (tab dentro de aca-se-version).
// Cómo lo hace: CRUD + helper de % usado/disponible; anchos fijos; lookup TIPO_EVALUACION.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { AcaSeSeccion, AcaSeTipoEvaluacionLookup } from './models/aca-se-seccion';
import { AcaSeSeccionRepository } from './aca-se-seccion.repository';

@Injectable({ providedIn: 'root' })
export class AcaSeSeccionService {
	constructor(
		private repo: AcaSeSeccionRepository,
		private appInfoService: AppInfoService
	) {}

	getAll(corrVersion: number): Observable<IResult> {
		return this.repo.getAll([{ Parameter: 'CORR_VERSION', Value: corrVersion }]);
	}

	// Qué hace: lista TIPO_EVALUACION (PREGUNTA / RANGO_MONTO) vía GEN_LISTA.
	getTIPO_EVALUACION(): Observable<IResult> {
		return this.appInfoService.getLookUp(
			'ACA_SE_VERSION',
			'GEN_LISTA',
			'GetTIPO_EVALUACION',
			undefined,
			environment.UrlGENERALAPI
		);
	}

	insert(model: AcaSeSeccion): Observable<IResult> {
		return this.repo.create(this.normalizar(model));
	}

	update(model: AcaSeSeccion): Observable<IResult> {
		return this.repo.update(this.normalizar(model), [
			{ Parameter: 'CORR_SECCION_SE', Value: model.CORR_SECCION_SE },
		]);
	}

	delete(corrSeccion: number): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_SECCION_SE', Value: corrSeccion }]);
	}

	activarInactivar(model: AcaSeSeccion): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_SECCION_SE', Value: model.CORR_SECCION_SE },
		]);
	}

	porcentajeUsado(secciones: AcaSeSeccion[], excluirCorr?: number): number {
		return (secciones ?? [])
			.filter((s) => s.ACTIVO === true && Number(s.CORR_SECCION_SE) !== Number(excluirCorr ?? -1))
			.reduce((acc, s) => acc + (Number(s.PORCENTAJE_MAXIMO) || 0), 0);
	}

	porcentajeDisponible(secciones: AcaSeSeccion[], excluirCorr?: number): number {
		return Math.max(0, 100 - this.porcentajeUsado(secciones, excluirCorr));
	}

	esValido(model: AcaSeSeccion, notify: (m: string, t: NotifyType) => void): boolean {
		if (!model?.CODIGO?.trim()) {
			notify('El código es obligatorio.', NotifyType.Warning);
			return false;
		}
		if (!model?.NOMBRE_SECCION?.trim()) {
			notify('El nombre de la sección es obligatorio.', NotifyType.Warning);
			return false;
		}
		const tipo = `${model?.TIPO_EVALUACION ?? ''}`.trim().toUpperCase();
		if (tipo !== 'PREGUNTA' && tipo !== 'RANGO_MONTO') {
			notify('Debe seleccionar el tipo de evaluación.', NotifyType.Warning);
			return false;
		}
		const p = Number(model.PORCENTAJE_MAXIMO);
		if (isNaN(p) || p < 0 || p > 100) {
			notify('El porcentaje máximo debe estar entre 0 y 100.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	modeloNuevo(corrVersion: number): AcaSeSeccion {
		return {
			CORR_SECCION_SE: 0,
			CORR_VERSION: corrVersion,
			CODIGO: '',
			NOMBRE_SECCION: '',
			DESCRIPCION: '',
			ORDEN: 0,
			PORCENTAJE_MAXIMO: 0,
			TIPO_EVALUACION: 'PREGUNTA',
			ACTIVO: true,
		};
	}

	getColumns(tipos?: AcaSeTipoEvaluacionLookup[]): any[] {
		const lookup = tipos ?? [];
		return [
			{ dataField: 'CORR_SECCION_SE', caption: 'Corr.', width: 80, dataType: 'number', allowEditing: false },
			{ dataField: 'CODIGO', caption: 'Código', width: 120 },
			{ dataField: 'NOMBRE_SECCION', caption: 'Sección', width: 220, minWidth: 150 },
			{ dataField: 'ORDEN', caption: 'Orden', width: 90, dataType: 'number' },
			{
				dataField: 'PORCENTAJE_MAXIMO',
				caption: '% máximo',
				width: 110,
				dataType: 'number',
				format: '#0.00',
			},
			{
				dataField: 'TIPO_EVALUACION',
				caption: 'Tipo evaluación',
				width: 160,
				lookup: lookup.length
					? { dataSource: lookup, valueExpr: 'Key', displayExpr: 'Value' }
					: undefined,
			},
			{ dataField: 'ACTIVO', caption: 'Activo', width: 90, dataType: 'boolean' },
			{ dataField: 'DESCRIPCION', caption: 'Descripción', width: 240, minWidth: 140 },
		];
	}

	private normalizar(model: AcaSeSeccion): any {
		return {
			CORR_SECCION_SE: model?.CORR_SECCION_SE ?? 0,
			CORR_VERSION: model?.CORR_VERSION,
			CODIGO: (model?.CODIGO ?? '').trim(),
			NOMBRE_SECCION: (model?.NOMBRE_SECCION ?? '').trim(),
			DESCRIPCION: model?.DESCRIPCION ? `${model.DESCRIPCION}`.trim() : null,
			ORDEN: Number(model?.ORDEN ?? 0),
			PORCENTAJE_MAXIMO: Number(model?.PORCENTAJE_MAXIMO ?? 0),
			TIPO_EVALUACION: `${model?.TIPO_EVALUACION ?? 'PREGUNTA'}`.trim().toUpperCase() || 'PREGUNTA',
			ACTIVO: !!model?.ACTIVO,
			CORR_EMPRESA: model?.CORR_EMPRESA ?? 1,
		};
	}
}
