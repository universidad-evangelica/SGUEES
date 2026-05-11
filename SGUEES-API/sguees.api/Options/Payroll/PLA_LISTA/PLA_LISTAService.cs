using sguees.Repositories;
using eFramework.Core;


namespace sguees.Services
{
	public class PLA_LISTAService : IPLA_LISTAService
	{
		private readonly IPLA_LISTARepository _repo;
		
		public PLA_LISTAService(IPLA_LISTARepository repo)
		{
			_repo = repo;
		}
		

        public CResult getCLASE_DEPARTAMENTO()
        {
            return _repo.getCLASE_DEPARTAMENTO();
        }
	}
}
