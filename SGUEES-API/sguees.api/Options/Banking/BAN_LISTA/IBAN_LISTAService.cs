using eFramework.Core;

namespace sguees.Services
{
	public interface IBAN_LISTAService
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
	}
}
