using System;

namespace sguees.Models
{
	public class COM_ORDEN_COMPRA_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
        public string NOMBRE_EMPRESA { get; set; }
        public int ANIO_PERIODO { get; set; }
        public int CORR_CUADRO_COMPARATIVO { get; set; }
        public string DIRECCION_EMPRESA { get; set; }
        public string TELEFONO_EMPRESA { get; set; }
        public string NUMERO_NRC_EMPRESA { get; set; }
        public string NUMERO_NIT_EMPRESA { get; set; }
        public string CODIGO_PROVEEDOR { get; set; }
        public string NOMBRE_PROVEEDOR { get; set; }
        public string DIRECCION_PROVEEDOR { get; set; }
        public string NOMBRE_COMERCIAL { get; set; }
        public string ACTIVIDAD_ECONOMICA { get; set; }
        public string CONDICION_PAGO { get; set; }
        public string CONTACTO { get; set; }
        public string CORREO { get; set; }
        public string TELEFONO { get; set; }
        public string NUMERO_CUADRO_COMPARATIVO { get; set; }
        public string NUMERO_ORDEN_COMPRA { get; set; }
        public DateTime FECHA_ORDEN_COMPRA { get; set; }
        public string NUMERO_SOLI_COTIZACION { get; set; }
        public DateTime FECHA_CUADRO_COMPARATIVO { get; set; }
        public int ANIO_PERIODO_SOLI_COTI { get; set; }
        public int CORR_SOLI_COTIZACION { get; set; }
        public string CODIGO_DEPTO { get; set; }
        public string NOMBRE_DEPARTAMENTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string NOMBRE_USUARIO_CREA { get; set; }
        public string OBSERVACIONES { get; set; }
        public string TOTAL_EN_LETRAS { get; set; }
        public decimal SUB_TOTAL { get; set; }
        public decimal TOTAL_IMPUESTO { get; set; }
        public decimal TOTAL_ORDEN { get; set; }

        public int ANIO_PERIODO_COTIZACION { get; set; }
        public int CORR_COTIZACION { get; set; }
        public int CORR_COTIZACION_DETA { get; set; }
        public string CODIGO_ITEM { get; set; }
        public string NOMBRE_ITEM { get; set; }
        public int CORR_UNIDAD_MEDIDA { get; set; }
        public string NOMBRE_UNIDAD_MEDIDA { get; set; }
        public decimal CANTIDAD { get; set; }
        public decimal PRECIO_UNITARIO { get; set; }
        public decimal MONTO_SUBTOTAL {get; set; }
        public string NOMBRE_CONDICION_PAGO { get; set; }
		public int CORR_FORMA_PAGO { get; set; }
		public string NOMBRE_FORMA_PAGO { get; set; }
		public string DETALLE_FORMA_PAGO { get; set; }
      
        public string USUARIO_REVISA { get; set; }
        public string GERENTE_CONTABILIDAD { get; set; }
        public string GERENTE_GENERAL { get; set; }
        public string RECTOR { get; set; }
        public string PERIODO { get; set; }
        public Byte[] LOGO1 { get; set; }
        public Byte[] LOGO2 { get; set; }
        public string TITULO_REPORTE { get; set; }
        public string NOMBRE_SISTEMA { get; set; }
        public DateTime FECHA_IMPRESION { get; set; }

        public string FIRMA1 { get; set; }
        public string NOMBRE_FIRMA1 { get; set; }
        public DateTime? FECHA_FIRMA1 { get; set; }
        public string FIRMA2 { get; set; }
        public string NOMBRE_FIRMA2 { get; set; }
        public DateTime? FECHA_FIRMA2 { get; set; }
        public string FIRMA3 { get; set; }
        public string NOMBRE_FIRMA3 { get; set; }
        public DateTime? FECHA_FIRMA3 { get; set; }
        public string FIRMA4 { get; set; }
        public string NOMBRE_FIRMA4 { get; set; }
        public DateTime? FECHA_FIRMA4 { get; set; }
	}
}
