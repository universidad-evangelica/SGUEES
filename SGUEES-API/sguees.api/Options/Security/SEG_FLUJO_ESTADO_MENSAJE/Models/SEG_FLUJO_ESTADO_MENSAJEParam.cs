using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_ESTADO_MENSAJEParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ESTADO_MENSAJE { get; set; }
        public int CORR_PASO { get; set; }
        public int CORR_ESTADO { get; set; }
        public int? CORR_ACTOR { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        
        // Nuevos parámetros de búsqueda por nombre (opcional)
        public string NOMBRE_PASO { get; set; }
        public string NOMBRE_ESTADO { get; set; }
        public string NOMBRE_ACTOR { get; set; }
        
        public int OPCION_CONSULTA { get; set; } = 0;
    }
}