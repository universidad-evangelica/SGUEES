import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { BanCuentaBancariaChequeraRepository } from './ban-cuenta-bancaria-chequera.repository';
import { BanCuentaBancariaChequera } from './models/ban-cuenta-bancaria-chequera';

@Injectable({
	providedIn: 'root',
})
export class BanCuentaBancariaChequeraService {
	constructor(private repo: BanCuentaBancariaChequeraRepository) {}

	esValido(model: BanCuentaBancariaChequera, msg: (text: string, type: NotifyType) => void): boolean {
		if (!model.NUMERO_CHEQUE_INICIAL || model.NUMERO_CHEQUE_INICIAL <= 0) {
			msg('El número de cheque inicial debe ser mayor a cero', NotifyType.Error);
			return false;
		}
		if (!model.NUMERO_CHEQUE_FINAL || model.NUMERO_CHEQUE_FINAL <= 0) {
			msg('El número de cheque final debe ser mayor a cero', NotifyType.Error);
			return false;
		}
		if (!model.NUMERO_CHEQUE_ACTUAL || model.NUMERO_CHEQUE_ACTUAL <= 0) {
			msg('El número de cheque actual debe ser mayor a cero', NotifyType.Error);
			return false;
		}
		if (model.NUMERO_CHEQUE_INICIAL >= model.NUMERO_CHEQUE_FINAL) {
			msg('El cheque inicial debe ser menor al final', NotifyType.Error);
			return false;
		}
		if (
			model.NUMERO_CHEQUE_ACTUAL < model.NUMERO_CHEQUE_INICIAL ||
			model.NUMERO_CHEQUE_ACTUAL > model.NUMERO_CHEQUE_FINAL
		) {
			msg('El cheque actual debe estar entre el inicial y el final', NotifyType.Error);
			return false;
		}
		if (!model.SERIE_CHEQUE?.trim()) {
			msg('Debe indicar la serie del cheque', NotifyType.Error);
			return false;
		}
		return true;
	}

	getAll(param: { CORR_CUENTA_BANCO: number }): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CUENTA_BANCO', Value: param.CORR_CUENTA_BANCO }];
		return this.repo.get(xWhere);
	}

	insert(model: BanCuentaBancariaChequera): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: BanCuentaBancariaChequera): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CHEQUERA', Value: model.CORR_CHEQUERA }];
		return this.repo.update(model, xWhere);
	}

	delete(model: BanCuentaBancariaChequera): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_CUENTA_BANCO', Value: model.CORR_CUENTA_BANCO },
			{ Parameter: 'CORR_CHEQUERA', Value: model.CORR_CHEQUERA },
		];
		return this.repo.delete(xWhere);
	}
}
