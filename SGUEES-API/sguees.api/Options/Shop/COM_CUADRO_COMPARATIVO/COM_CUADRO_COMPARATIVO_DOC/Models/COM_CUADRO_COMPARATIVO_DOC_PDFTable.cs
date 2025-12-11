using System;
using eFramework.Data;

namespace sguees.Models
{
    public class COM_CUADRO_COMPARATIVO_DOC_PDFTable
    {
        public Int32 CORR_EMPRESA { get; set; }
        public Int32 ANIO_PERIODO { get; set; }
        public Int32 CORR_CUADRO_COMPARATIVO { get; set; }
        public Int32 CORR_DOCUMENTO { get; set; }
        public String NOMBRE_DOCUMENTO { get; set; }
        public String DESCRIPCION_DOCUMENTO { get; set; }
        public Int32 CORR_TIPO_DOCUMENTO { get; set; }
        public String NOMBRE_ARCHIVO { get; set; }
        public IFormFile FOTO_DOCUMENTO { get; set; }
        public String USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public String ESTACION_CREA { get; set; }
        public String USUARIO_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
        public String ESTACION_ACTU { get; set; }
    }
}
