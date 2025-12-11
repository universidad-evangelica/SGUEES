using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class COM_LISTARepository : ICOM_LISTARepository
	{
		 public COM_LISTARepository(IConfiguration config)
        {
			
        }

		public CResult GetESTADO_SOLI_COTIZACION()
        {
            CResult objResultado = new();

            objResultado.Data = new List<COM_LISTAView>()
            {
                new() { Key = "DI", Value = "DIGITADO" },
                new() { Key = "SO", Value = "SOLICITADO" },
                new() { Key = "AP", Value = "APLICADO" },
                new() { Key = "AN", Value = "ANULADO" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetESTADO_COTIZACION()
        {
            CResult objResultado = new();

            objResultado.Data = new List<COM_LISTAView>()
            {
                new() { Key = "DI", Value = "DIGITADO" },
                new() { Key = "SO", Value = "PENDIENTE" },
                new() { Key = "AP", Value = "APLICADO" },
                new() { Key = "AN", Value = "ANULADO" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetESTADO_CUADRO_COMPARATIVO()
        {
            CResult objResultado = new();

            objResultado.Data = new List<COM_LISTAView>()
            {
                new() { Key = "DI", Value = "DIGITADO" },
                new() { Key = "SO", Value = "SOLICITADO" },
                new() { Key = "EN", Value = "ENVIADO" },
                new() { Key = "AP", Value = "APLICADO" },
                new() { Key = "AN", Value = "ANULADO" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_COMENTARIO()
        {
            CResult objResultado = new();

            objResultado.Data = new List<COM_LISTAView>()
            {
                new() { Key = "IN", Value = "INTERNO" },
                new() { Key = "EX", Value = "EXTERNO" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_BANCO()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<COM_LISTAView>()
            {
                new() { Key = "CREDO", Value = "Credomaticic" },
                new() { Key = "CUSCA", Value = "Cuscatlan" },
                new() { Key = "BAG", Value = "Agricola" },
                new() { Key = "BDV", Value = "Davivienda" },
                new() { Key = "BPM", Value = "Promerica" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCLASE_TIPO_SOLI_COTIZA()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<COM_LISTAView>()
            {
                new() { Key = "NO", Value = "Normal" },
                new() { Key = "EX", Value = "Express" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetESTADO_DOCUMENTO()
        {
            CResult objResultado = new();

            objResultado.Data = new List<COM_LISTAView>()
            {
                new() { Key = "DI", Value = "DIGITADO" },
                new() { Key = "AP", Value = "APLICADO" },
                new() { Key = "AN", Value = "ANULADO" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetESTADO_ADMINISTRATIVO()
        {
            CResult objResultado = new();

            objResultado.Data = new List<COM_LISTAView>()
            {
                new() { Key = "AP", Value = "Aplicado" },
                new() { Key = "LI", Value = "Liquidado" },
                new() { Key = "PR", Value = "Provisionado" },
                new() { Key = "SO", Value = "Soli Pago" },
                new() { Key = "RE", Value = "Rev. Conta" },
                new() { Key = "PG", Value = "Programado" },
                new() { Key = "AU", Value = "Autorizado" },
                new() { Key = "PA", Value = "Pagado" },
                new() { Key = "AB", Value = "Abonado" },
                new() { Key = "AN", Value = "Anulado" },
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
