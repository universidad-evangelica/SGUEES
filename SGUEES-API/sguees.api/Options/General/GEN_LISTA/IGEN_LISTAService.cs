using eFramework.Core;

namespace sguees.Services
{
	public interface IGEN_LISTAService
	{
	    CResult GetESTADO_PROVEEDOR();
		CResult GetESTADO_PROVEEDOR_WEB();
		CResult GetTIPO_PERSONERIA();
		CResult GetCLASE_FORMA_PAGO();
		CResult GetTIPO_USUARIO();
		CResult GetESTADO_USUARIO();
		CResult GetCLASE_AUTORIZACION();
		CResult GetCODIGO_OPCION_COMPRAS();
		CResult GetCLASE_BITACORA();
		CResult GetCLASE_RUBRO();
		CResult GetTIPO_APLICACION();
		CResult GetSUMA_RESTA();
		CResult GetCLASE_DOCUMENTO();
		CResult GetLIBRO_IVA();
		CResult GetMES();
	}
}
