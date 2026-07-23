import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IResult } from 'src/app/FxAPI/IResult';
import { BanTipoMoviSegunBancoRepository } from './ban-tipo-movi-segun-banco.repository';
import { BanTipoMoviSegunBanco } from '../models/ban-tipo-movi-segun-banco';

@Injectable({ providedIn: 'root' })
export class BanTipoMoviSegunBancoService {
	constructor(private repo: BanTipoMoviSegunBancoRepository) {}

	getAll(corrTipoMovimiento: number): Observable<IResult> {
		return this.repo.getAll(corrTipoMovimiento);
	}

	insert(model: BanTipoMoviSegunBanco): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: BanTipoMoviSegunBanco): Observable<IResult> {
		return this.repo.update(model);
	}

	delete(model: BanTipoMoviSegunBanco): Observable<IResult> {
		return this.repo.delete(model);
	}

	getSegunBancoColumns(): any[] {
		return [
			{ dataField: 'NOMBRE_BANCO', caption: 'Banco', width: 180, allowEditing: false },
			{ dataField: 'CODIGO_MOVIMIENTO', caption: 'Código banco', width: 120 },
			{ dataField: 'NOMBRE_MOVIMIENTO_SEGUN_BANCO', caption: 'Nombre según banco', minWidth: 220 },
		];
	}
}
