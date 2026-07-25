using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_PASO_ACCION_ESTADOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FLUJO_PROCESO { get; set; }
        public int CORR_PASO { get; set; }
        public int CORR_ACCION { get; set; }
        public int CORR_ESTADO_DESTINO { get; set; }
        
        // Nuevos parámetros de búsqueda por nombre (opcional)
        public string NOMBRE_ESTADO { get; set; }
        public string TIPO_MOVIMIENTO { get; set; }
        public string TIPO_NOTIFICACION { get; set; }
        
        
    }
}