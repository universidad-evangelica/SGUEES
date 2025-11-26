using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace scueesRpt.Models
{
    public class COM_SOLI_COTIZACION_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public string NOMBRE_EMPRESA { get; set; }
        public int ANIO_PERIODO { get; set; }
        public int CORR_SOLI_COTIZACION { get; set; }
        public string NUMERO_SOLI_COTIZACION { get; set; }
        public DateTime FECHA_SOLI_COTIZACION { get; set; }
        public DateTime FECHA_LIMITE_COTIZACION { get; set; }
        public string CODIGO_DEPTO { get; set; }
        public string NOMBRE_DEPARTAMENTO { get; set; }
        public int ANIO_PERIODO_SOLI_COMPRA { get; set; }
        public int CORR_SOLI_COMPRA { get; set; }
        public string USUARIO_SOLI { get; set; }
        public string OBSERVACIONES { get; set; }
        public string ESTADO_SOLI_COTIZACION { get; set; }
        public string NOMBRE_ESTADO_SOLI_COTIZACION { get; set; }

        public int CORR_SOLI_COTIZACION_DETA { get; set; }
        public string CODIGO_ITEM { get; set; }
        public string NOMBRE_ITEM { get; set; }
        public decimal CANTIDAD { get; set; }
        public int CORR_UNIDAD_MEDIDA { get; set; }
        public string NOMBRE_UNIDAD_MEDIDA { get; set; }
        public string OBSERVACIONES_DETA { get; set; }
        public string ESTADO_SOLI_COTIZACION_DETA { get; set; }
        public string NOMBRE_ESTADO_SOLI_COTIZACION_DETA { get; set; }

        public string PERIODO { get; set; }
        public Byte[] LOGO1 { get; set; }
        public Byte[] LOGO2 { get; set; }
        public string TITULO_REPORTE { get; set; }
        public string NOMBRE_SISTEMA { get; set; }
        public DateTime FECHA_IMPRESION { get; set; }

    }
}
