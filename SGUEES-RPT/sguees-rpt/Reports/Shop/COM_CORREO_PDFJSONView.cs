using System;

namespace sgueesRpt.Models
{
    public class COM_CORREO_PDFJSONView
    {
        public string NOMBRE_REC { get; set; }
        public string CODIGO_GENERACION { get; set; }
        public DateTime FECHA_GENERACION { get; set; }
        public string NOMBRE_EMPRESA { get; set; } = "";
        public string DIRECCION_EMPRESA { get; set; } = "";
        public string TELEFONO_EMPRESA { get; set; } = "";
        public string URL_WEB_EMPRESA { get; set; } = "";

    }
}
