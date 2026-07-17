using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class BAN_LISTARepository : IBAN_LISTARepository
	{
		 public BAN_LISTARepository(IConfiguration config)
        {
			
        }

		public CResult GetAUMENTA_DISMINUYE()
        {
            CResult objResultado = new();

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "1", Value = "Aumenta" },
                new() { Key = "-1", Value = "Disminuye" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_TIPO_CHEQUE()
        {
            CResult objResultado = new();

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "PR", Value = "Pago Proveedor" },
                new() { Key = "EM", Value = "Pago Empleado" },
                new() { Key = "RC", Value = "Reintegro de Caja" },
                new() { Key = "CL", Value = "Pago Cliente" },
                new() { Key = "OT", Value = "Otro" },
                new() { Key = "PV", Value = "Provisionado" },
                new() { Key = "IC", Value = "Intercompañía" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetSUMA_RESTA()
        {
            CResult objResultado = new();

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "1", Value = "Suma" },
                new() { Key = "-1", Value = "Resta" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_MOVIMIENTO()
        {
            CResult objResultado = new();

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "CHQ", Value = "Cheque" },
                new() { Key = "TTE", Value = "Transferencia Tercero" },
                new() { Key = "TPR", Value = "Transferencia Propio" },
                new() { Key = "RCA", Value = "Remesa de Caja" },
                new() { Key = "RCL", Value = "Remesa Cliente" },
                new() { Key = "NCR", Value = "Nota de Crédito" },
                new() { Key = "NDE", Value = "Nota de Débito" },
                new() { Key = "TIC", Value = "Transferencia Intercompañía" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetTIPO_CUENTA_BANCO()
        {
            CResult objResultado = new();

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "AH", Value = "Ahorro" },
                new() { Key = "CO", Value = "Corriente" },
                new() { Key = "OT", Value = "Otro" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetESTADO_CUENTA()
        {
            CResult objResultado = new();

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "AC", Value = "Activa" },
                new() { Key = "IN", Value = "Inactiva" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_CHEQUE()
        {
            CResult objResultado = new();

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "VO", Value = "Voucher" },
                new() { Key = "PE", Value = "Personal" }
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

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "CREDO", Value = "Credomatic" },
                new() { Key = "CUSCA", Value = "Cuscatlán" },
                new() { Key = "BAG", Value = "Agrícola" },
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

        public CResult GetESTADO_DOCUMENTO()
        {
            CResult objResultado = new();

            objResultado.Data = new List<BAN_LISTAView>()
            {
                new() { Key = "DI", Value = "Digitado" },
                new() { Key = "AP", Value = "Aplicado" },
                new() { Key = "IM", Value = "Impreso" },
                new() { Key = "AN", Value = "Anulado" },
                new() { Key = "SO", Value = "Solicitando Autorización" },
                new() { Key = "VA", Value = "Validación" },
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
