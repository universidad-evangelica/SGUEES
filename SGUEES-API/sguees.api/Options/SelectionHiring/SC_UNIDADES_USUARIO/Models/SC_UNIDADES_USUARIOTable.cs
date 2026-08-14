// Qué hace: campos de escritura de SC_UNIDADES_USUARIO.
// Cómo: representa la asignación empresa-unidad-usuario con auditoría y sin campo ACTIVO.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_UNIDADES_USUARIOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
