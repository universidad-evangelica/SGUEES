using System.Collections.Generic;

namespace sguees.Models
{
    // Qué hace: lote de respuestas del estudio socioeconómico que el ERP guarda de una vez (PUT Guardar).
    // Cómo lo hace: una fila por pregunta de la versión; el repositorio decide actualizar, insertar o
    //               borrar según el tipo de pregunta y si trae valor.
    public class ACA_PROSPECTO_SE_RESPUESTA_GUARDARParam
    {
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_SOCIOECONOMICO { get; set; }
        public List<ACA_PROSPECTO_SE_RESPUESTA_ITEM> RESPUESTAS { get; set; } = new();
    }

    public class ACA_PROSPECTO_SE_RESPUESTA_ITEM
    {
        public int CORR_PREGUNTA { get; set; }
        public string VALOR_TEXTO { get; set; }
        public decimal? VALOR_NUMERO { get; set; }
        public bool? VALOR_BIT { get; set; }
        public int? CORR_OPCION { get; set; }
    }
}
