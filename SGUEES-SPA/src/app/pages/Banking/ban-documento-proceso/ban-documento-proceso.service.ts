import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { BanDocumentoProcesoScope, BanDocumentoRepository } from '../ban-documento/ban-documento.repository';

import { BanDocumentoService } from '../ban-documento/ban-documento.service';



export type BanDocumentoProcesoModo = BanDocumentoProcesoScope | 'documento-contabilizar';

export type FiltroContabilizado = 'pendiente' | 'contabilizado' | 'todos';



@Injectable({

	providedIn: 'root',

})

export class BanDocumentoProcesoService {

	constructor(

		private repo: BanDocumentoRepository,

		private documentoService: BanDocumentoService

	) {}



	esModoLote(modo: BanDocumentoProcesoModo): boolean {

		return modo === 'documento-contabilizar';

	}



	getAll(modo: BanDocumentoProcesoModo, param: any): Observable<any> {

		if (modo === 'documento-contabilizar') {

			return this.documentoService.getAllContabilizar(param);

		}

		return this.documentoService.getAll(modo, param);

	}



	contabilizar(model: any): Observable<any> {

		return this.documentoService.contabilizar(model);

	}

	descontabilizar(model: any): Observable<any> {

		return this.documentoService.descontabilizar(model);

	}

	getConsultaViewItems(esCheque: boolean): any[] {

		return this.documentoService.getConsultaViewItems(esCheque);

	}

	getDetalleConsultaColumns(): any[] {

		return this.documentoService.getDetalleConsultaColumns();

	}



	ejecutar(modo: BanDocumentoProcesoModo, model: any): Observable<any> {

		if (modo === 'cheque-imprimir') {

			return this.documentoService.imprimirCheque(model);

		}

		if (modo === 'documento-anular' || modo === 'cheque-anular') {

			return this.documentoService.anular(modo, model);

		}

		return this.documentoService.aplicar(modo as 'documento-aplicar' | 'cheque-aplicar', model);

	}



	getUrlOpcion(modo: BanDocumentoProcesoModo): string {

		switch (modo) {

			case 'documento-contabilizar':

				return '/ban-documento-contabilizar';

			case 'cheque-aplicar':

				return '/ban-cheque-aplicar';

			case 'cheque-imprimir':

				return '/ban-cheque-imprimir';

			case 'cheque-anular':

				return '/ban-cheque-anular';

			case 'documento-anular':

				return '/ban-documento-anular';

			default:

				return '/ban-documento-aplicar';

		}

	}



	getAccionLabel(modo: BanDocumentoProcesoModo): string {

		if (modo === 'documento-contabilizar') {

			return 'Contabilizar';

		}

		if (modo === 'cheque-imprimir') {

			return 'Imprimir Cheque';

		}

		if (modo === 'documento-anular' || modo === 'cheque-anular') {

			return 'Anular';

		}

		return 'Aplicar';

	}

	getDescontabilizarExitoLabel(): string {

		return 'Documentos des-contabilizados con éxito';

	}



	getExitoLabel(modo: BanDocumentoProcesoModo): string {

		if (modo === 'documento-contabilizar') {

			return 'Documentos contabilizados con éxito';

		}

		if (modo === 'cheque-imprimir') {

			return 'Cheque impreso con éxito';

		}

		if (modo === 'documento-anular' || modo === 'cheque-anular') {

			return 'Documento anulado con éxito';

		}

		return 'Documento aplicado con éxito';

	}



	getColumns(modo: BanDocumentoProcesoModo, agruparPorEstado = false): any[] {

		if (modo === 'documento-contabilizar') {

			return this.documentoService.getContabilizarColumns(agruparPorEstado);

		}

		return this.documentoService.getColumns(modo.startsWith('cheque'));

	}



	getSummary(): any {

		return this.documentoService.getSummary();

	}

}


