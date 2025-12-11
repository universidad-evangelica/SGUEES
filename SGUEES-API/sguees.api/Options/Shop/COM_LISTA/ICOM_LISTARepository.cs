using eFramework.Core;

namespace sguees.Repositories
{
	public interface ICOM_LISTARepository
	{
		CResult GetESTADO_SOLI_COTIZACION();
		CResult GetESTADO_COTIZACION();
		CResult GetESTADO_CUADRO_COMPARATIVO();
		CResult GetCLASE_COMENTARIO();
		CResult GetCLASE_BANCO();
		CResult GetCLASE_TIPO_SOLI_COTIZA();
		CResult GetESTADO_DOCUMENTO();
		CResult GetESTADO_ADMINISTRATIVO();
	}
}
