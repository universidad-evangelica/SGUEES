using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_CICLO (combo de ciclos de pregrado de la consulta de prospectos).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PERIODOS_ACADEMICOS_CICLOView
    {
        public int CORR_EMPRESA { get; set; }
        public string CICLO { get; set; }
        public short ANIO { get; set; }
        public byte? NUMERO_PERIODO { get; set; }
        public string NOMBRE_CICLO { get; set; }
        public int? CLAVE_CICLO { get; set; }
        public int? CANTIDAD_PROSPECTOS { get; set; }
        public bool? ES_CICLO_DEFECTO { get; set; }
    }
}
