using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_JSONTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string VERSION { get; set; }
		public int CORR_TIPO_AMBIENTE { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public string NUMERO_CONTROL { get; set; }
		public string CODIGO_GENERACION { get; set; }
		public string SELLO_RECEPCION { get; set; }
		public int CORR_MODELO_FACTURACION { get; set; }
		public int CORR_TIPO_TRANSMISION { get; set; }
		public DateTime FECHA_GENERACION { get; set; }
		public DateTime HORA_GENERACION { get; set; }
		public int CORR_MONEDA { get; set; }
		public int CORR_TIPO_DIP_REC { get; set; }
		public string NUMERO_DOC_REC { get; set; }
		public string NUMERO_NCR_REC { get; set; }
		public string NOMBRE_REC { get; set; }
		public int CORR_ACTIVIDAD_ECONOMICA_REC { get; set; }
		public string NOMBRE_COMERCIAL_REC { get; set; }
		public int CORR_PERSONERIA_REC { get; set; }
		public string DIRECCION_REC { get; set; }
		public int CORR_DEPTO_REC { get; set; }
		public int CORR_MUNICIPIO_REC { get; set; }
		public string TELEFONO_REC { get; set; }
		public string CORREO_ELECTRONICO_REC { get; set; }
		public string NUMERO_NIT_EMI { get; set; }
		public string NUMERO_NRC_EMI { get; set; }
		public string NOMBRE_EMISOR { get; set; }
		public int CORR_ACTIVIDAD_ECONOMICA_EMI { get; set; }
		public string NOMBRE_COMERCIAL_EMI { get; set; }
		public int CORR_TIPO_ESTABLECIMIENTO_EMI { get; set; }
		public string DIRECCION_EMI { get; set; }
		public int CORR_DEPTO_EMI { get; set; }
		public int CORR_MUNICIPIO_EMI { get; set; }
		public string TELEFONO_EMI { get; set; }
		public string CORREO_ELECTRONICO_EMI { get; set; }
		public string CODIGO_ESTABLECIMIENTO_MH { get; set; }
		public string CODIGO_ESTABLECIMIENTO { get; set; }
		public string CODIGO_PUNTO_VENTA_MH { get; set; }
		public string CODIGO_PUNTO_VENTA { get; set; }
		public string NIT_VENTA_TERCERO { get; set; }
		public string NOMBRE_VENTA_TERCERO { get; set; }
		public string ESTADO_DOCUMENTO { get; set; }
		public int CORR_CONDICION_OPERACION { get; set; }
		public string NUMERO_PAGO_ELECTRONICO { get; set; }
		public string NOMBRE_ENTREGA { get; set; }
		public string NUMERO_DIP_ENTREGA { get; set; }
		public string NOMBRE_RECIBE { get; set; }
		public string NUMERO_DIP_RECIBE { get; set; }
		public string OBSERVACION { get; set; }
		public string NUMERO_PLACA { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
