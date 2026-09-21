using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_LIMITACION_FISICA (limitaciones físicas declaradas por el prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_LIMITACION_FISICAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO_LIMITACION_FISICA { get; set; }
        public int CORR_LIMITACION_FISICA { get; set; }
        public string NOMBRE_LIMITACION { get; set; }
        public string ESPECIFIQUE { get; set; }
    }
}
