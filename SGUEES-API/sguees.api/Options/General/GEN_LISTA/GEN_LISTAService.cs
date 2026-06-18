using sguees.Repositories;
using eFramework.Core;


namespace sguees.Services
{
	public class GEN_LISTAService : IGEN_LISTAService
	{
		private readonly IGEN_LISTARepository _repo;
		
		public GEN_LISTAService(IGEN_LISTARepository repo)
		{
			_repo = repo;
		}
		
		public CResult GetESTADO_PROVEEDOR()
        {
            return _repo.GetESTADO_PROVEEDOR();
        }
        public CResult GetESTADO_PROVEEDOR_WEB()
        {
            return _repo.GetESTADO_PROVEEDOR_WEB();
        }
        public CResult GetTIPO_PERSONERIA()
        {
            return _repo.GetTIPO_PERSONERIA();
        }

		public CResult GetCLASE_FORMA_PAGO()
        {
            return _repo.GetCLASE_FORMA_PAGO();
        }
        public CResult GetTIPO_USUARIO()
        {
            return _repo.GetTIPO_USUARIO();
        }
        public CResult GetESTADO_USUARIO()
        {
            return _repo.GetESTADO_USUARIO();
        }
        public CResult GetCLASE_AUTORIZACION()
        {
            return _repo.GetCLASE_AUTORIZACION();
        }
        public CResult GetCLASE_BITACORA()
        {
            return _repo.GetCLASE_BITACORA();
        }
        public CResult GetCODIGO_OPCION_COMPRAS()
        {
            return _repo.GetCODIGO_OPCION_COMPRAS();
        }
        public CResult GetCLASE_RUBRO()
        {
            return _repo.GetCLASE_RUBRO();
        }
        public CResult GetTIPO_APLICACION()
        {
            return _repo.GetTIPO_APLICACION();
        }
        public CResult GetSUMA_RESTA()
        {
            return _repo.GetSUMA_RESTA();
        }
        public CResult GetCLASE_DOCUMENTO()
        {
            return _repo.GetCLASE_DOCUMENTO();
        }
        public CResult GetLIBRO_IVA()
        {
            return _repo.GetLIBRO_IVA();
        }
        public CResult GetMES()
        {
            return _repo.GetMES();
        }
       
	}
}
