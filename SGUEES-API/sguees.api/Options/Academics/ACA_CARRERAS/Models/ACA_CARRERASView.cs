using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.ACA_CARRERAS (combo de la edición de prospectos).
    // Cómo lo hace: cada tipo coincide exacto con la tabla; eFramework asigna sin convertir
    //               y un tipo distinto deja el valor en su default.
    public class ACA_CARRERASView
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
