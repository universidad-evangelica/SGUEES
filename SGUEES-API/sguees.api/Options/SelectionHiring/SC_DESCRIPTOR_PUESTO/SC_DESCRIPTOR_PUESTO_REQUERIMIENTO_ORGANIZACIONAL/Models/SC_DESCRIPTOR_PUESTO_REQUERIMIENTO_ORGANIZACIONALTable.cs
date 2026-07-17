using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // entidad de escritura/auditoria de SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONAL.
    public class SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_REQUERIMIENTO_ORGANIZACIONAL { get; set; }
        public string DESCRIPCION { get; set; }
        public int? CORR_DESCRIPTOR_PUESTO { get; set; }
        public int? CORR_REQUERIMIENTO_ORGANIZACIONAL { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
