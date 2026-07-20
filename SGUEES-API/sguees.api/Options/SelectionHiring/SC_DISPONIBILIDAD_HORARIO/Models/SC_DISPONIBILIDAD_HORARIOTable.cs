// Qué hace: entidad de persistencia de disponibilidad de horario.
// Cómo: mapea los campos de la tabla SC_DISPONIBILIDAD_HORARIO, incluida su auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Qué hace: representa los campos de la tabla SC_DISPONIBILIDAD_HORARIO.
    // Cómo: expone el correlativo, el nombre, el estado y los campos de auditoría de creación/actualización.
    public class SC_DISPONIBILIDAD_HORARIOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DISPONIBILIDAD_HORARIO { get; set; }
        public string NOMBRE_DISPONIBILIDAD_HORARIO { get; set; }
        // Indica si la disponibilidad de horario está activa (true) o inactiva (false); por defecto activa.
        public bool? ESTADO_DISPONIBILIDAD_HORARIO { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
