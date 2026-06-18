using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class PLA_LISTARepository : IPLA_LISTARepository
	{
		 public PLA_LISTARepository(IConfiguration config)
        {
			
        }


        public CResult getCLASE_DEPARTAMENTO()
        {
            CResult objResultado = new ();

            objResultado.Data = new List<PLA_LISTAView>()
            {
                new PLA_LISTAView() { Key = "OT", Value = "Otros" },
                new PLA_LISTAView() { Key = "AD", Value = "Administrativo" },
                new PLA_LISTAView() { Key = "OP", Value = "Operativo" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
    }

    
}
