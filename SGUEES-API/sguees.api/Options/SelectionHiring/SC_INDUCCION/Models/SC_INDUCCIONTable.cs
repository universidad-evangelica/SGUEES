// Entidad de persistencia de inducción (mapeo a la tabla).
using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de tabla de inducción, incluyendo auditoría.
    public class SC_INDUCCIONTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_INDUCCION { get; set; }
        public string NOMBRE_INDUCCION { get; set; }
        // Cantidad de tiempo que dura la inducción (se interpreta junto con UNIDAD_TIEMPO).
        public int TIEMPO_INDUCCION { get; set; }
        // Unidad del tiempo de inducción: solo 'Semanas' o 'Meses' (coincide exacto con el CHECK de la tabla).
        public string UNIDAD_TIEMPO { get; set; }
        // Estado del catálogo: true = activo, false = inactivo.
        public bool? ESTADO_INDUCCION { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
