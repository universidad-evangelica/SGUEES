using eFramework.Data;

namespace sguees.Models
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public int CORR_EMPLEADO { get; set; }
        public int CORR_UNIDAD_EMPLEADO { get; set; }
        public int CORR_UNIDAD_ORIGEN { get; set; }  // Para filtrar empleados por unidad
        public int CORR_UNIDAD_DESTINO { get; set; } // Unidad a la que se asigna
        public int CORR_JEFE { get; set; }           // Para obtener un jefe específico
        public int ACTIVO { get; set; }              // Para filtrar por activo/inactivo
        public int OPCION_CONSULTA { get; set; } = 0;
    }
}