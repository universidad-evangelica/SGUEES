using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_CONTACTO (correos y teléfonos del prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_CONTACTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO_CONTACTO { get; set; }
        public string CONTACTO { get; set; }
        public string TIPO_CONTACTO { get; set; }
        public bool ES_CORREO { get; set; }
        public bool ES_TELEFONO { get; set; }
        public bool ES_PRINCIPAL { get; set; }
        public bool ES_TRABAJO { get; set; }
    }
}
