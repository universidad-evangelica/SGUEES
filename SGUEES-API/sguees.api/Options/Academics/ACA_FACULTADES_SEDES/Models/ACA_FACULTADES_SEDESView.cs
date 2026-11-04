using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_FACULTADES_SEDES (grid de la sección "Sedes de la Facultad").
    // Cómo lo hace: trae la empresa de la facultad y el nombre de la sede; tipos exactos a la vista.
    public class ACA_FACULTADES_SEDESView
    {
        public int CORR_FACULTAD { get; set; }
        public int CORR_EMPRESA { get; set; }
        public int CORR_SEDE { get; set; }
        public string CODIGO_SEDE { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public bool? ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
