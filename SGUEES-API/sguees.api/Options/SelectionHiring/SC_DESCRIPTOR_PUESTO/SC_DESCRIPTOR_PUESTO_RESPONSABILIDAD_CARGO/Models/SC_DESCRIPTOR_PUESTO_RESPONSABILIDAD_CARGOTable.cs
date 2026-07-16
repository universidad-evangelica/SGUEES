using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_RESPONSABILIDAD { get; set; }
        public string NOMBRE_RESPONSABILIDAD { get; set; }
        public string INFORMACION { get; set; }
        public string APLICA_DESCRIPTOR { get; set; }
        public int? CORR_DESCRIPTOR_PUESTO { get; set; }
        public int? CORR_RESPONSABILIDAD { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
