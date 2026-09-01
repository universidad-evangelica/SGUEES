using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_PERFIL_PUESTO: encabezado del perfil del descriptor de puesto.
    public class SC_PERFIL_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de este perfil.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public byte? EDAD_MINIMA { get; set; }
        public byte? EDAD_MAXIMA { get; set; }
        public string SEXO { get; set; }
        public string ESTADO_FAMILIAR { get; set; }
        // FK al catálogo de disponibilidad de horario.
        public int? CORR_DISPONIBILIDAD_HORARIO { get; set; }
        // Snapshot: nombre de la disponibilidad de horario guardado en el registro.
        public string NOMBRE_DISPONIBILIDAD_HORARIO { get; set; }
        // FK al catálogo de tipo de modalidad de trabajo.
        public int? CORR_TIPO_MODALIDAD { get; set; }
        // Snapshot: nombre de la modalidad guardado en el registro.
        public string NOMBRE_MODALIDAD { get; set; }
        // Indica si el puesto requiere licencia de conducir.
        public bool? LICENCIA { get; set; }
        // Texto libre adicional del perfil (impresión formato corto).
        public string OTROS { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
