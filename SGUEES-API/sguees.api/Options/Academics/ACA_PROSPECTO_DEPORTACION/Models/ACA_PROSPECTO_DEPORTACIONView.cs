using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_DEPORTACION (deportaciones declaradas por el prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_DEPORTACIONView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO_DEPORTACION { get; set; }
        public int CORR_PAIS { get; set; }
        public string NOMBRE_PAIS { get; set; }
        public bool ES_VIGENTE { get; set; }
        public string OBSERVACION { get; set; }
    }
}
