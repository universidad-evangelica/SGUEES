using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.ACA_SE_OPCION (combo de la edición de prospectos).
    // Cómo lo hace: cada tipo coincide exacto con la tabla; eFramework asigna sin convertir
    //               y un tipo distinto deja el valor en su default.
    public class ACA_SE_OPCIONView
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
