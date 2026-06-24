using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_DESCRIPTOR_IMPACTO_ECONOMICOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_IMPACTO_ECONOMICO { get; set; }
        public string DESCRIPCION { get; set; }
        public bool? ESTADO_IMPACTO_ECONOMICO { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
