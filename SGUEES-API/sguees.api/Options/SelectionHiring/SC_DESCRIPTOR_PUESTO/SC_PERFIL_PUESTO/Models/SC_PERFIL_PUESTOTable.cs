using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de escritura de la tabla SC_PERFIL_PUESTO: encabezado del perfil (requisitos generales de
    // la persona) asociado a un descriptor de puesto; es el padre de educación, experiencia y competencias.
    public class SC_PERFIL_PUESTOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de este perfil.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public byte? EDAD_MINIMA { get; set; }
        public byte? EDAD_MAXIMA { get; set; }
        public string SEXO { get; set; }
        public string ESTADO_FAMILIAR { get; set; }
        // Indica si el puesto requiere licencia de conducir.
        public bool? LICENCIA { get; set; }
        // FK al catálogo de disponibilidad de horario.
        public int? CORR_DISPONIBILIDAD_HORARIO { get; set; }
        // Snapshot: nombre de la disponibilidad de horario tomado del catálogo al momento de guardar.
        public string NOMBRE_DISPONIBILIDAD_HORARIO { get; set; }
        // FK al catálogo de tipo de modalidad de trabajo.
        public int? CORR_TIPO_MODALIDAD { get; set; }
        // Snapshot: nombre de la modalidad tomado del catálogo al momento de guardar.
        public string NOMBRE_MODALIDAD { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
