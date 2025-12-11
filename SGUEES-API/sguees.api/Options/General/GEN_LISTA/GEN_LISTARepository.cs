using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_LISTARepository : IGEN_LISTARepository
	{
		 public GEN_LISTARepository(IConfiguration config)
        {
			
        }

		public CResult GetESTADO_PROVEEDOR()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "A", Value = "Activo" },
                new GEN_LISTAView() { Key = "I", Value = "Inactivo" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetESTADO_PROVEEDOR_WEB()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "D", Value = "Digitado" },
                new GEN_LISTAView() { Key = "A", Value = "Activo" },
                new GEN_LISTAView() { Key = "I", Value = "Inactivo" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetTIPO_PERSONERIA()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = "N", Value = "Natural" },
                new() { Key = "J", Value = "Jurídico" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_FORMA_PAGO()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "BMO", Value = "Billetes y Monedas" },
                new GEN_LISTAView() { Key = "CHE", Value = "Cheque" },
                new GEN_LISTAView() { Key = "TCR", Value = "Enviado" },
                new GEN_LISTAView() { Key = "TDB", Value = "Transferencia Deposito Bancario" },
                new GEN_LISTAView() { Key = "VCO", Value = "Vales o cupones" },
                new GEN_LISTAView() { Key = "DEL", Value = "Dinero Electrónico" },
                new GEN_LISTAView() { Key = "MEL", Value = "Monedero Electrónico" },
                new GEN_LISTAView() { Key = "CTR", Value = "Certificado o Tarjeta de Regalo" },
                new GEN_LISTAView() { Key = "BIT", Value = "Bitcoin" },
                new GEN_LISTAView() { Key = "OCR", Value = "Otras Criptomonedas" },
                new GEN_LISTAView() { Key = "CXR", Value = "Cuentas Por Pagar del Receptor" },
                new GEN_LISTAView() { Key = "GBA", Value = "Giro Bancario" },
                new GEN_LISTAView() { Key = "OTR", Value = "Otros" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_MODELO_FACTURACION()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "PM", Value = "Previo" },
                new GEN_LISTAView() { Key = "MD", Value = "Diferido" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_TIPO_CONTINGENCIA()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "SMH", Value = "No Disponibilidad de Sistema del MH <" },
                new GEN_LISTAView() { Key = "SCL", Value = "No Disponibilidad de sistema del emisor" },
                new GEN_LISTAView() { Key = "IEM", Value = "Falla en el Suministro de Servicio de Internet del Emisor" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCLASE_TIPO_INVALIDACION()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "EID", Value = "Error en la informacion del Documento Tributario Electrónico a Invalidar" },
                new GEN_LISTAView() { Key = "ROR", Value = "Prescindir de la Operación realizada" },
                new GEN_LISTAView() { Key = "OTR", Value = "Otro" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCLASE_TIPO_PERSONERIA()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "N", Value = "Persona Natural" },
                new GEN_LISTAView() { Key = "J", Value = "Persona Jurídica" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCLASE_TIPO_TRANSMISION()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "TN", Value = "Normal" },
                new GEN_LISTAView() { Key = "TC", Value = "Contingencia" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCLASE_TRIBUTO()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "TN", Value = "Normal" },
                new GEN_LISTAView() { Key = "TC", Value = "Contingencia" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetTIPO_USUARIO()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = 1, Value = "Solo consulta" },
                new GEN_LISTAView() { Key = 2, Value = "Normal" },
                new GEN_LISTAView() { Key = 3, Value = "Supervisor o Auditor" },
                new GEN_LISTAView() { Key = 4, Value = "Administrador del sistema" },
                new GEN_LISTAView() { Key = 5, Value = "Super Administrador" }
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetESTADO_USUARIO()
        {
            CResult objResultado = new();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = 0, Value = "Pendiente de Activar" },
                new() { Key = 1, Value = "Usuario Activo" },
                new() { Key = 2, Value = "Usuario Suspendido" },
                new() { Key = 3, Value = "Usuario Cancelado" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetESTADO_DONANTE()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = "A", Value = "Activo" },
                new() { Key = "I", Value = "Inactivo" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
		public CResult GetCLASE_BITACORA()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
             {
                new() { Key = "SI", Value = "Sincronizar" },
                new() { Key = "AP", Value = "Aplicar" },
                new() { Key = "DA", Value = "Des-aplicar" },
                new() { Key = "AN", Value = "Anular" },
                new() { Key = "EL", Value = "Eliminar" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCODIGO_OPCION_VENTAS()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "VEN_DOCUMENTO", Value = "Documenton de Ventas" },
                new GEN_LISTAView() { Key = "VEN_INVALIDACION", Value = "Invalidaciones" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }

        public CResult GetCLASE_AUTORIZACION()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = "CC", Value = "Cordinador Compra" },
                new() { Key = "GC", Value = "Gerencia Compra" },
                new() { Key = "GG", Value = "Gerencia General" },
                new() { Key = "RE", Value = "Rectoria" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCODIGO_OPCION_COMPRAS()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = "COM_SOLI_COTIZACION", Value = "Solicitud de Cotizacion" },
                new GEN_LISTAView() { Key = "COM_COTIZACION", Value = "Oportunidades para cotizar" },
                new GEN_LISTAView() { Key = "COM_CUADRO_COMPARATIVO", Value = "Cuadro Comparativo" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCLASE_RUBRO()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = "NSU", Value = "No Sujeto" },
                new() { Key = "EXE", Value = "Exento" },
                new() { Key = "GRA", Value = "Gravado" },
                new() { Key = "IVA", Value = "IVA" },
                new() { Key = "PER", Value = "IVA Percibido" },
                new() { Key = "PE2", Value = "IVA Percibido 2%" },
                new() { Key = "RET", Value = "IVA Retenido" },
                new() { Key = "ISR", Value = "Renta" },
                new() { Key = "STO", Value = "SubTotal" },
                new() { Key = "VTO", Value = "Venta total" },
                new() { Key = "FOV", Value = "FOVIAL" },
                new() { Key = "OTR", Value = "Otro" },
                new() { Key = "DES", Value = "Descuento" },
                new() { Key = "MUN", Value = "Municipal" },
                new() { Key = "INT", Value = "Internación" },
                new() { Key = "IMP", Value = "Importación" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetTIPO_APLICACION()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = "PVG", Value = "Porcentaje al valor gravado" },
                new() { Key = "MPC", Value = "Monto por cantidad" },
                new() { Key = "TAB", Value = "Monto por tabla" },
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
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = 1, Value = "Suma" },
                new() { Key = -1, Value = "Resta" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetCLASE_DOCUMENTO()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = "FAC", Value = "No Contribuyente"},
                new() { Key = "CCF", Value = "Contribuyente" },
                new() { Key = "ING", Value = "Ingreso"},
                new() { Key = "FEX", Value = "Factura de Exportacion" },
                new() { Key = "NCR", Value = "Nota de Crédito" },
                new() { Key = "NDB", Value = "Nota de Débito" },
                new() { Key = "AJU", Value = "Ajuste" },
                new() { Key = "ANT", Value = "Anticipo" },
                new() { Key = "CRT", Value = "Comp. Retención" },
                new() { Key = "INT", Value = "Internación" },
                new() { Key = "IMP", Value = "Importación" },
                new() { Key = "EXC", Value = "Sujeto Excluido" },
                new() { Key = "ESP", Value = "Excluido Especial" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetLIBRO_IVA()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new() { Key = "VCO", Value = "Ventas Contribuyentes" },
                new() { Key = "VNC", Value = "Ventas No Contribuyentes" },
                new() { Key = "CCO", Value = "Compras Contribuyente" },
                new() { Key = "NIN", Value = "Ninguno" },
            };

            objResultado.Result = true;
            objResultado.RowsAffected = 1;
            objResultado.CodeHelper = 0;
            objResultado.ErrorCode = 0;
            objResultado.ErrorMessage = "";
            objResultado.ErrorSource = "";

            return objResultado;
        }
        public CResult GetMES()
        {
            CResult objResultado = new CResult();

            objResultado.Data = new List<GEN_LISTAView>()
            {
                new GEN_LISTAView() { Key = 1, Value = "Enero" },
                new GEN_LISTAView() { Key = 2, Value = "Febrero" },
                new GEN_LISTAView() { Key = 3, Value = "Marzo" },
                new GEN_LISTAView() { Key = 4, Value = "Abril" },
                new GEN_LISTAView() { Key = 5, Value = "Mayo" },
                new GEN_LISTAView() { Key = 6, Value = "Junio" },
                new GEN_LISTAView() { Key = 7, Value = "Julio" },
                new GEN_LISTAView() { Key = 8, Value = "Agosto" },
                new GEN_LISTAView() { Key = 9, Value = "Septiembre" },
                new GEN_LISTAView() { Key = 10, Value = "Octubre" },
                new GEN_LISTAView() { Key = 11, Value = "Noviembre" },
                new GEN_LISTAView() { Key = 12, Value = "Diciembre" },
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
