using eFramework.Core;

namespace sguees.Services
{
	public class CON_LISTAService : ICON_LISTAService
	{
		private readonly ICON_LISTARepository _repo;

		public CON_LISTAService(ICON_LISTARepository repo)
		{
			_repo = repo;
		}

		public CResult GetESTADO_PARTIDA()
		{
			return _repo.GetESTADO_PARTIDA();
		}

		public CResult GetCLASE_PARTIDA()
		{
			return _repo.GetCLASE_PARTIDA();
		}

		public CResult GetESTADO_CENTRO_COSTO()
		{
			return _repo.GetESTADO_CENTRO_COSTO();
		}

		public CResult GetCLASE_AUXILIAR()
		{
			return _repo.GetCLASE_AUXILIAR();
		}

		public CResult GetCLASE_RUBRO()
		{
			return _repo.GetCLASE_RUBRO();
		}

		public CResult GetCLASE_VALUACION()
		{
			return _repo.GetCLASE_VALUACION();
		}

		public CResult GetCLASE_VALUACION_CATALOGO_CUENTA()
		{
			return _repo.GetCLASE_VALUACION_CATALOGO_CUENTA();
		}

		public CResult GetCLASE_CENTRO_COSTO()
		{
			return _repo.GetCLASE_CENTRO_COSTO();
		}

		public CResult GetCORR_TIPO_CENTRO_COSTO()
		{
			return _repo.GetCORR_TIPO_CENTRO_COSTO();
		}

		public CResult GetCORR_UNIDAD_NEGOCIO()
		{
			return _repo.GetCORR_UNIDAD_NEGOCIO();
		}

		public CResult GetCORR_AREA_FUNCIONAL()
		{
			return _repo.GetCORR_AREA_FUNCIONAL();
		}

		public CResult GetCLASE_UNIDAD_NEGOCIO()
		{
			return _repo.GetCLASE_UNIDAD_NEGOCIO();
		}
	}
}
