using eFramework.Core;

namespace sguees.Repositories
{
	public interface IBAN_LISTARepository
	{
		CResult GetAUMENTA_DISMINUYE();
		CResult GetCLASE_TIPO_CHEQUE();
		CResult GetSUMA_RESTA();
		CResult GetCLASE_MOVIMIENTO();
		CResult GetTIPO_CUENTA_BANCO();
		CResult GetESTADO_CUENTA();
		CResult GetCLASE_CHEQUE();
		CResult GetCLASE_BANCO();
		CResult GetESTADO_DOCUMENTO();
		CResult GetESTADO_CONCILIACION();
		CResult GetCORR_PROVEEDOR();
		CResult GetCORR_EMPLEADO();
		CResult GetCORR_CLIENTE();
	}
}
