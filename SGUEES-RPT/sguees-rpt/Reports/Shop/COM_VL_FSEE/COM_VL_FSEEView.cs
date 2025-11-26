using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace scueesRpt.Models
{
    public class COM_VL_FSEEView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DOCUMENTO { get; set; }
        public string VERSION { get; set; }
        public int CORR_TIPO_AMBIENTE { get; set; }
        public string NOMBRE_TIPO_AMBIENTE { get; set; }
        public int CORR_TIPO_DOC { get; set; }
        public string NOMBRE_TIPO_DOC { get; set; }
        public string NUMERO_NIT_EMI { get; set; }
        public string NUMERO_NRC_EMI { get; set; }
        public string NOMBRE_EMI { get; set; }
        public string NOMBRE_ACTIVIDAD_ECONOMICA_EMI { get; set; }
        public string NOMBRE_COMERCIAL_EMI { get; set; }
        public string DIRECCION_EMI { get; set; }
        public string TELEFONO_EMI { get; set; }
        public string CORREO_ELECTRONICO_EMI { get; set; }
        public string RESPONSABLE_EMI { get; set; }
        public string NUMERO_DOCUMENTO_RESPONSABLE_EMI { get; set; }

        public string NUMERO_DOCUMENTO_REC { get; set; }
        public string NUMERO_NIT_REC { get; set; }
        public string NUMERO_NRC_REC { get; set; }
        public string NOMBRE_REC { get; set; }
        public string NOMBRE_ACTIVIDAD_ECONOMICA_REC { get; set; }
        public string NOMBRE_COMERCIAL_REC { get; set; }
        public string DIRECCION_REC { get; set; }
        public string TELEFONO_REC { get; set; }
        public string CORREO_ELECTRONICO_REC { get; set; }
        public string RESPONSABLE_REC { get; set; }
        public string NUMERO_DOCUMENTO_RESPONSABLE_REC { get; set; }

        public int CORR_CONDICION_PAGO { get; set; }
        public string NOMBRE_CONDICION_PAGO { get; set; }
        public string TOTAL_LETRAS { get; set; }
        public string OBSERVACIONES { get; set; }
        public string NOMBRE_CONDICION_OPERACION { get; set; }

        public string NUMERO_ITEM { get; set; }
        public int CORR_TIPO_ITEM { get; set; }
        public string NUMERO_DOCUMENTO_REL { get; set; }
        public string CODIGO_DOCUMENTO { get; set; }
        public int CORR_TRIBUTO_IVA { get; set; }
        public string DESCRIPCION { get; set; }
        public decimal CANTIDAD { get; set; }
        public int CORR_UNIDAD_MEDIDA { get; set; }
        public string NOMBRE_UNIDAD_MEDIDA { get; set; }
        public decimal PRECIO_UNITARIO { get; set; }
        public decimal MONTO_DESCUENTO { get; set; }
        public decimal MONTO_TOTAL { get; set; }
        public decimal VENTA_NO_SUJETA { get; set; }
        public decimal VENTA_EXENTA { get; set; }
        public decimal VENTA_GRAVADA { get; set; }
        public decimal PRECIO_SUGERIDO_VENTA { get; set; }
        public decimal MONTO_NO_GRAVADO { get; set; }

        public decimal TOTAL_OPERACIONES { get; set; }
        public decimal TOTAL_SUMATORIA_VENTAS { get; set; }
        public decimal IVA { get; set; }
        public decimal SUB_TOTAL { get; set; }
        public decimal IVA_RETENIDO { get; set; }
        public decimal RETENCION_RENTA { get; set; }
        public decimal MONTO_TOTAL_OPERACIONES { get; set; }
        public decimal MONTO_TOTAL_OTROS_NO_AFECTADO { get; set; }

        public decimal TOTAL_DESCUENTO { get; set; }
        public decimal TOTAL_IVA_RETE { get; set; }
        public decimal TOTAL_ISR_RETE { get; set; }
        public decimal TOTAL_PAGAR { get; set; }

        public string CODIGO_GENERACION { get; set; }
        public string NUMERO_CONTROL { get; set; }
        public string SELLO_RECEPCION { get; set; }
        public string NOMBRE_TIPO_TRANSACCION { get; set; }
        public string NOMBRE_MODELO_FACTURACION { get; set; }
        public int CORR_MONEDA { get; set; }
        public string SIMBOLO_MONEDA { get; set; }
        public DateTime FECHA_GENERACION { get; set; }
        public DateTime HORA_GENERACION { get; set; }

        public String URL_CONSULTA { get; set; }
        public Byte[] QR_CONSULTA { get; set; }
        public string PERIODO { get; set; }
        public Byte[] LOGO1 { get; set; }
        public Byte[] LOGO2 { get; set; }
        public string TITULO_REPORTE { get; set; }
        public string NOMBRE_SISTEMA { get; set; }
        public DateTime FECHA_IMPRESION { get; set; }
        public string CODIGO_GENERACION_INVALIDACION { get; set; }
        public string SELLO_RECEPCION_INVALIDACION { get; set; }
        public string ESTADO_DOCUMENTO { get; set; }

    }
}
