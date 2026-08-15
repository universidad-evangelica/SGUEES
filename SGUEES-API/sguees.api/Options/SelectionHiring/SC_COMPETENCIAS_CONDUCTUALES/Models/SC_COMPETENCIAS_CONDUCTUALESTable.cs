// Qué hace: entidad de persistencia de competencia conductual.
// Cómo: mapea los campos de la tabla SC_COMPETENCIAS_CONDUCTUALES, incluida su auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Qué hace: representa los campos de la tabla SC_COMPETENCIAS_CONDUCTUALES.
    // Cómo: expone el correlativo, tipo de puesto, nombre, descripción, estado y los campos de auditoría de creación/actualización.
    public class SC_COMPETENCIAS_CONDUCTUALESTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_COMPETENCIAS_CONDUCTUALES { get; set; }
        public int? CORR_TIPO_PUESTO { get; set; }
        public string NOMBRE_COMPETENCIAS_CONDUCTUALES { get; set; }
        public string DESCRIPCION { get; set; }
        // Indica si la competencia conductual está activa (true) o inactiva (false); por defecto activa.
        public bool? ESTADO_COMPETENCIAS_CONDUCTUALES { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
