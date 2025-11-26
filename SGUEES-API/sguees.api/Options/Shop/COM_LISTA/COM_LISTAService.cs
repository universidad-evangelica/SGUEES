using scuees.Repositories;
using eFramework.Core;


namespace scuees.Services
{
	public class COM_LISTAService : ICOM_LISTAService
	{
		private readonly ICOM_LISTARepository _repo;

		public COM_LISTAService(ICOM_LISTARepository repo)
		{
			_repo = repo;
		}

		public CResult GetESTADO_SOLI_COTIZACION()
		{
			return _repo.GetESTADO_SOLI_COTIZACION();
		}

		public CResult GetESTADO_COTIZACION()
		{
			return _repo.GetESTADO_COTIZACION();
		}

		public CResult GetESTADO_CUADRO_COMPARATIVO()
		{
			return _repo.GetESTADO_CUADRO_COMPARATIVO();
		}

		public CResult GetCLASE_COMENTARIO()
		{
			return _repo.GetCLASE_COMENTARIO();
		}

		public CResult GetCLASE_BANCO()
		{
			return _repo.GetCLASE_BANCO();
		}
		public CResult GetCLASE_TIPO_SOLI_COTIZA()
		{
			return _repo.GetCLASE_TIPO_SOLI_COTIZA();
		}
		public CResult GetESTADO_DOCUMENTO()
		{
			return _repo.GetESTADO_DOCUMENTO();
		}
		public CResult GetESTADO_ADMINISTRATIVO()
		{
			return _repo.GetESTADO_ADMINISTRATIVO();
		}
	}
}
