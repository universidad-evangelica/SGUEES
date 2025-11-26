using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace scueesRpt.Models
{
    public class COM_CUADRO_COMPARATIVO_TOTAL_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public string NOMBRE_EMPRESA { get; set; }
        public int ANIO_PERIODO { get; set; }
        public int GRUPO_GENERAL { get; set; }
        public int CORR_CUADRO_COMPARATIVO { get; set; }
        public string NOMBRE_PROVEEDOR { get; set; }
        public decimal MONTO_ASIGNADO { get; set; }

        public string PERIODO { get; set; }
        public Byte[] LOGO1 { get; set; }
        public Byte[] LOGO2 { get; set; }
        public string TITULO_REPORTE { get; set; }
        public string NOMBRE_SISTEMA { get; set; }
        public DateTime FECHA_IMPRESION { get; set; }

    }
}
