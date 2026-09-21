using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO para la futura fase de edición.
    // Cómo lo hace: omite CONTRASENA_PROSPECTO y GUID_REGISTRO; el ERP nunca debe escribirlos.
    public class ACA_PROSPECTOTable : BaseEntity
    {
        public int CORR_PROSPECTO { get; set; }
        public string CODIGO_PROSPECTO { get; set; }
        public bool ACTIVO_PROSPECTO { get; set; }
        public int CORR_PLAN_ACADEMICO { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public string ESTADO { get; set; }
        public string FORMA_INGRESO { get; set; }
        public string FINANCIA_ESTUDIOS { get; set; }
        public string FECHA_HORA_INICIO { get; set; }
        public DateTime? FECHA_PROCESAMIENTO { get; set; }
        public string USUARIO_PROCESA { get; set; }
        public DateTime? FECHA_PROCESA { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
