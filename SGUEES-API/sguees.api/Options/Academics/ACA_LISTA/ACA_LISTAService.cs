using eFramework.Core;
using sguees.Repositories;

namespace sguees.Services
{
	// Qué hace: expone las listas fijas de Académico al controller.
	// Cómo lo hace: delega en el repositorio.
	public class ACA_LISTAService : IACA_LISTAService
	{
		private readonly IACA_LISTARepository _repo;

		public ACA_LISTAService(IACA_LISTARepository repo)
		{
			_repo = repo;
		}

		public CResult GetFORMA_INGRESO()
		{
			return _repo.GetFORMA_INGRESO();
		}

		public CResult GetTIPO_EDUCACION()
		{
			return _repo.GetTIPO_EDUCACION();
		}

		public CResult GetTIPO_CONTACTO()
		{
			return _repo.GetTIPO_CONTACTO();
		}
	}
}
