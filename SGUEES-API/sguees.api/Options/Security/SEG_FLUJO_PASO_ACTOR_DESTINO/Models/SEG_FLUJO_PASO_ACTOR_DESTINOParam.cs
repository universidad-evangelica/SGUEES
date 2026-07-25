using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_PASO_ACTOR_DESTINOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PASO_ACTOR_DESTINO { get; set; }
        public int CORR_PASO { get; set; }
        public int CORR_ACTOR { get; set; }
        public int? CORR_UNIDAD { get; set; }
        
        // Nuevos parámetros de búsqueda por nombre (opcional)
        public string NOMBRE_PASO { get; set; }
        public string NOMBRE_ACTOR { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        
        public int OPCION_CONSULTA { get; set; } = 0;
    }
}