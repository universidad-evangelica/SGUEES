using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_SE_OPCION.
    // Cómo lo hace: espejo de la tabla; hoy esta carpeta solo expone el combo de prospectos.
    public class ACA_SE_OPCIONTable : BaseEntity
    {
        public int CORR_OPCION { get; set; }
        public int CORR_PREGUNTA { get; set; }
        public string CODIGO { get; set; }
        public string TEXTO { get; set; }
        public int ORDEN { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
