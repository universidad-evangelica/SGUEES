using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_MEDIO_ORIGEN (medios por los que el prospecto conoció la universidad).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_MEDIO_ORIGENView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO_MEDIO { get; set; }
        public int CORR_MEDIO_ORIGEN { get; set; }
        public string NOMBRE_MEDIO { get; set; }
        public byte? ORDEN_MEDIO { get; set; }
        public string DESCRIPCION { get; set; }
        public string ESTUDIANTE_REFIERE { get; set; }
        public int? CORR_CARRERA_REFIERE { get; set; }
        public string CARRERA_REFIERE { get; set; }
    }
}
