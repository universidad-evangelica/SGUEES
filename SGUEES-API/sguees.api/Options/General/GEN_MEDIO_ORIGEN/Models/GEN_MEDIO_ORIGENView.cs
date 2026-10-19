using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.GEN_MEDIO_ORIGEN (combo de la edición de prospectos).
    // Cómo lo hace: cada tipo coincide exacto con la tabla; eFramework asigna sin convertir
    //               y un tipo distinto deja el valor en su default.
    public class GEN_MEDIO_ORIGENView
    {
        public int CORR_MEDIO_ORIGEN { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string CODIGO { get; set; }
        public string NOMBRE { get; set; }
        public string DESCRIPCION { get; set; }
        public byte ORDEN { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
