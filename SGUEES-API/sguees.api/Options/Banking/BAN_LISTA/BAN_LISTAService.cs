using sguees.Repositories;
using eFramework.Core;


namespace sguees.Services
{
	public class BAN_LISTAService : IBAN_LISTAService
	{
		private readonly IBAN_LISTARepository _repo;

		public BAN_LISTAService(IBAN_LISTARepository repo)
		{
			_repo = repo;
		}

		public CResult GetAUMENTA_DISMINUYE()
		{
			return _repo.GetAUMENTA_DISMINUYE();
		}

		public CResult GetCLASE_TIPO_CHEQUE()
		{
			return _repo.GetCLASE_TIPO_CHEQUE();
		}

		public CResult GetSUMA_RESTA()
		{
			return _repo.GetSUMA_RESTA();
		}

		public CResult GetCLASE_MOVIMIENTO()
		{
			return _repo.GetCLASE_MOVIMIENTO();
		}

		public CResult GetTIPO_CUENTA_BANCO()
		{
			return _repo.GetTIPO_CUENTA_BANCO();
		}

		public CResult GetESTADO_CUENTA()
		{
			return _repo.GetESTADO_CUENTA();
		}

		public CResult GetCLASE_CHEQUE()
		{
			return _repo.GetCLASE_CHEQUE();
		}

		public CResult GetCLASE_BANCO()
		{
			return _repo.GetCLASE_BANCO();
		}
	}
}
