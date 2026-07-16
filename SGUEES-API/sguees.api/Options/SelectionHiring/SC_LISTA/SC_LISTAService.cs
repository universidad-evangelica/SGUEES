using eFramework.Core;
using SGUEES.Repositories;

namespace SGUEES.Services
{
    public class SC_LISTAService : ISC_LISTAService
    {
        private readonly ISC_LISTARepository _repo;

        public SC_LISTAService(ISC_LISTARepository repo)
        {
            _repo = repo;
        }

        public CResult GetNIVEL_DOMINIO()
        {
            return _repo.GetNIVEL_DOMINIO();
        }

        public CResult GetSEXO()
        {
            return _repo.GetSEXO();
        }

        public CResult GetESTADO_FAMILIAR()
        {
            return _repo.GetESTADO_FAMILIAR();
        }

        public CResult GetLICENCIA()
        {
            return _repo.GetLICENCIA();
        }

        public CResult GetTIPO_REQUERIDO()
        {
            return _repo.GetTIPO_REQUERIDO();
        }

        public CResult GetFORMATO()
        {
            return _repo.GetFORMATO();
        }

        public CResult GetNIVEL()
        {
            return _repo.GetNIVEL();
        }
    }
}
