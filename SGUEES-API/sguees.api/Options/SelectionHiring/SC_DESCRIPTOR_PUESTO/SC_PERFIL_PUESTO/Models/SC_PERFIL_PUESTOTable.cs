using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // entidad de escritura/auditoria de SC_PERFIL_PUESTO.
    public class SC_PERFIL_PUESTOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public byte? EDAD_MINIMA { get; set; }
        public byte? EDAD_MAXIMA { get; set; }
        public string SEXO { get; set; }
        public string ESTADO_FAMILIAR { get; set; }
        public bool? LICENCIA { get; set; }
        public int? CORR_DISPONIBILIDAD_HORARIO { get; set; }
        public string NOMBRE_DISPONIBILIDAD_HORARIO { get; set; }
        public int? CORR_TIPO_MODALIDAD { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
