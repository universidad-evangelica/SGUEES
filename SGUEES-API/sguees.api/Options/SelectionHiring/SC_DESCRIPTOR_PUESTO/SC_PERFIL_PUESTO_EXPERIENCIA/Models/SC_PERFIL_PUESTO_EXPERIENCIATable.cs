using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Entidad de escritura de experiencia del perfil del puesto.
    public class SC_PERFIL_PUESTO_EXPERIENCIATable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_EXPERIENCIA { get; set; }
        public string REQUISITO { get; set; }
        // Indica si la experiencia es requerida u opcional.
        public string TIPO_REQUERIDO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
