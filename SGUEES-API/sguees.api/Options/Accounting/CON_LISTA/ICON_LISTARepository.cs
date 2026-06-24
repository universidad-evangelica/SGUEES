using eFramework.Core;

namespace sguees.Services
{
	public interface ICON_LISTARepository
	{
		CResult GetESTADO_PARTIDA();
		CResult GetCLASE_PARTIDA();
		CResult GetESTADO_CENTRO_COSTO();
		CResult GetCLASE_AUXILIAR();
		CResult GetCLASE_RUBRO();
		CResult GetCLASE_VALUACION();
		CResult GetCLASE_VALUACION_CATALOGO_CUENTA();
		CResult GetCLASE_CENTRO_COSTO();
		CResult GetCORR_TIPO_CENTRO_COSTO();
		CResult GetCORR_UNIDAD_NEGOCIO();
		CResult GetCORR_AREA_FUNCIONAL();
		CResult GetCLASE_UNIDAD_NEGOCIO();
	}
}
