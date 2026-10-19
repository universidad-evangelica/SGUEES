using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_FACULTADES (grid de la pantalla y base de las validaciones).
    // Cómo lo hace: además de la tabla trae los conteos de lo que depende de la facultad; cada tipo coincide
    //               exacto con la vista porque eFramework asigna sin convertir.
    public class ACA_FACULTADESView
    {
        public int CORR_FACULTAD { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string CODIGO_FACULTAD { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public bool? ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public int CARRERAS_ACTIVAS { get; set; }
        public int CARRERAS { get; set; }
        public int PERIODOS { get; set; }
        public string SEDES { get; set; }
    }
}
