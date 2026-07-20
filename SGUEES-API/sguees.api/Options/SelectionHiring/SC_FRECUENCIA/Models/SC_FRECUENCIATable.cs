// Qué hace: entidad de persistencia de frecuencia.
// Cómo: mapea los campos de la tabla SC_FRECUENCIA, incluida su auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Qué hace: representa los campos de la tabla SC_FRECUENCIA.
    // Cómo: expone el correlativo, el nombre, el estado y los campos de auditoría de creación/actualización.
    public class SC_FRECUENCIATable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FRECUENCIA { get; set; }
        public string NOMBRE_FRECUENCIA { get; set; }
        // Indica si la frecuencia está activa (true) o inactiva (false); por defecto activa.
        public bool? ESTADO_FRECUENCIA { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
