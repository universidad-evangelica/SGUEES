using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace sgueesRpt.Models
{
    public class COM_CUADRO_COMPARATIVO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public string NOMBRE_EMPRESA { get; set; }
        public int ANIO_PERIODO { get; set; }
        public int GRUPO_GENERAL { get; set; }
        public int CORR_CUADRO_COMPARATIVO { get; set; }
        public string NUMERO_CUADRO_COMPARATIVO { get; set; }
        public string NUMERO_SOLI_COTIZACION { get; set; }
        public DateTime FECHA_CUADRO_COMPARATIVO { get; set; }
        public string USUARIO_CUADRO_COMPARATIVO { get; set; }
        public string OBSERVACIONES { get; set; }
        public bool ES_MEJOR_PRECIO { get; set; }
        public bool TIENE_CREDITO_30_DIAS { get; set; }
        public bool TIENE_BUEN_SOPORTE_TECNICO { get; set; }
        public bool TIENE_BUENA_CALIDAD_PRODUCTO { get; set; }
        public bool TIENE_MEJOR_TIEMPO_ENTREGA { get; set; }
        public bool BRINDA_BUENA_EXPERIENCIA_PROVEEDOR { get; set; }
        public bool ES_PROVEEDOR_UNICO { get; set; }
        public bool EXISTE_OTRA_RAZON { get; set; }
        public string NOMBRE_OTRA_RAZON { get; set; }
        public int ANIO_PERIODO_SOLI_COTI { get; set; }
        public int CORR_SOLI_COTIZACION { get; set; }
        public string CODIGO_DEPTO { get; set; }
        public string NOMBRE_DEPARTAMENTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string NOMBRE_USUARIO_CREA { get; set; }

        public int ANIO_PERIODO_COTIZACION { get; set; }
        public int CORR_COTIZACION { get; set; }
        public int CORR_COTIZACION_DETA { get; set; }
        public string CODIGO_ITEM { get; set; }
        public string NOMBRE_ITEM { get; set; }
        public int CORR_UNIDAD_MEDIDA { get; set; }
        public string NOMBRE_UNIDAD_MEDIDA { get; set; }
        public decimal CANTIDAD { get; set; }
        public string NOMBRE_PROVEEDOR_1 { get; set; }
        public bool SELECCION_1 { get; set; }
        public decimal PRECIO_UNITARIO_1 { get; set; }
        public decimal MONTO_SUBTOTAL_1 {get; set; }
        public string MARCA_1 { get; set; }
        public decimal MONTO_ASIGNADO_1 { get; set; }
        public string NOMBRE_PROVEEDOR_2 { get; set; }
        public bool SELECCION_2 { get; set; }
        public decimal PRECIO_UNITARIO_2 { get; set; }
        public decimal MONTO_SUBTOTAL_2 { get; set; }
        public string MARCA_2 { get; set; }
        public decimal MONTO_ASIGNADO_2 { get; set; }
        public string NOMBRE_PROVEEDOR_3 { get; set; }
        public bool SELECCION_3 { get; set; }
        public decimal PRECIO_UNITARIO_3 { get; set; }
        public decimal MONTO_SUBTOTAL_3 { get; set; }
        public string MARCA_3 { get; set; }
        public decimal MONTO_ASIGNADO_3 { get; set; }
        public string USUARIO_REVISA { get; set; }
        public string GERENTE_CONTABILIDAD { get; set; }
        public string GERENTE_GENERAL { get; set; }
        public string RECTOR { get; set; }
        public List<COM_CUADRO_COMPARATIVO_TOTAL_IMPRView> TOTAL_PROVEEDORES { get; set; }
        public string PERIODO { get; set; }
        public Byte[] LOGO1 { get; set; }
        public Byte[] LOGO2 { get; set; }
        public string TITULO_REPORTE { get; set; }
        public string NOMBRE_SISTEMA { get; set; }
        public DateTime FECHA_IMPRESION { get; set; }

        public string FIRMA1 { get; set; }
        public string NOMBRE_FIRMA1 { get; set; }
        public DateTime FECHA_FIRMA1 { get; set; }
        public string FIRMA2 { get; set; }
        public string NOMBRE_FIRMA2 { get; set; }
        public DateTime FECHA_FIRMA2 { get; set; }
        public string FIRMA3 { get; set; }
        public string NOMBRE_FIRMA3 { get; set; }
        public DateTime FECHA_FIRMA3 { get; set; }
        public string FIRMA4 { get; set; }
        public string NOMBRE_FIRMA4 { get; set; }
        public DateTime FECHA_FIRMA4 { get; set; }
    }
}
