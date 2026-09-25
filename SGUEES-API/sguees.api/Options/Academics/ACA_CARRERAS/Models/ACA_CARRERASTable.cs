using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_CARRERAS.
    // Cómo lo hace: espejo de la tabla; hoy esta carpeta solo expone el combo de prospectos.
    public class ACA_CARRERASTable : BaseEntity
    {
        public int CORR_CARRERA { get; set; }
        public int CORR_EMPRESA { get; set; }
        public int CORR_FACULTAD { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int? CORR_GRADO_ACADEMICO { get; set; }
        public string CODIGO_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
