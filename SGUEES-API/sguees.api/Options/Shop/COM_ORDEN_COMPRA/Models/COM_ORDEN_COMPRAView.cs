using System;

namespace sguees.Models
{
	public class COM_ORDEN_COMPRAView
	{
		public int CORR_EMPRESA { get; set; }
        public int ANIO_PERIODO { get; set; }
        public int CORR_CUADRO_COMPARATIVO { get; set; }
        public DateTime FECHA_ORDEN_COMPRA { get; set; }
		public int NUMERO_ORDEN_COMPRA { get; set; }
        public string CODIGO_PROVEEDOR { get; set; }
        public string NOMBRE_PROVEEDOR { get; set; }
        public string DIRECCION_PROVEEDOR { get; set; }
        public string NOMBRE_COMERCIAL { get; set; }
        public string ACTIVIDAD_ECONOMICA { get; set; }
        public string NOMBRE_CONTACTO { get; set; }
        public string CORREO_ELECTRONICO_PROVEEDOR { get; set; }
        public string TELEFONO_PROVEEDOR { get; set; }
        public string CONDICION_PAGO { get; set; }
        public string NUMERO_SOLI_COTIZACION { get; set; }
        public string NOMBRE_DEPARTAMENTO { get; set; }
        public string CODIGO_DEPTO { get; set; }
        public string OBSERVACIONES { get; set; }
        public string TOTAL_EN_LETRAS { get; set; }
        public decimal SUB_TOTAL { get; set; }
        public decimal TOTAL_IMPUESTO { get; set; }
        public decimal TOTAL_ORDEN { get; set; }
        public string FIRMA1 { get; set; }
        public string NOMBRE_FIRMA1 { get; set; }
        public DateTime? FECHA_FIRMA1 { get; set; }
        public string FIRMA2 { get; set; }
        public string NOMBRE_FIRMA2 { get; set; }
        public DateTime? FECHA_FIRMA2 { get; set; }
        public string FIRMA3 { get; set; }
        public string NOMBRE_FIRMA3 { get; set; }
        public DateTime? FECHA_FIRMA3 { get; set; }
		public string USUARIO_CREA_SOLI { get; set; }
        public string AUTORIZACIONES_REALIZADAS { get; set; }
        public string NOMBRE_CONDICION_PAGO { get; set; }
		public int CORR_FORMA_PAGO { get; set; }
		public string NOMBRE_FORMA_PAGO { get; set; }
		public string DETALLE_FORMA_PAGO { get; set; }
        public string ESTADO_ORDEN_COMPRA { get; set; }
        public string NOMBRE_ESTADO_ORDEN_COMPRA { get; set; }
		
	}
}
