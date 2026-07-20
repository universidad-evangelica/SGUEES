export interface BanCuentaBancariaChequera {

	CORR_EMPRESA: number;

	CORR_CUENTA_BANCO: number;

	NUMERO_CUENTA_BANCO?: string;

	CORR_CHEQUERA: number;

	NUMERO_CHEQUE_INICIAL: number;

	NUMERO_CHEQUE_FINAL: number;

	NUMERO_CHEQUE_ACTUAL: number;

	SERIE_CHEQUE: string;

	ESTADO_CHEQUERA: string;

	CLASE_CHEQUE?: string;

}


