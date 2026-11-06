using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: fila de dbo.GEN_SEDES. Hoy solo la usa el combo de sedes de otras pantallas.
    public class GEN_SEDESTable : BaseEntity
    {
        public int CORR_SEDE { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string CODIGO_SEDE { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public string DIRECCION_SEDE { get; set; }
        public string ESTADO_SEDE { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
