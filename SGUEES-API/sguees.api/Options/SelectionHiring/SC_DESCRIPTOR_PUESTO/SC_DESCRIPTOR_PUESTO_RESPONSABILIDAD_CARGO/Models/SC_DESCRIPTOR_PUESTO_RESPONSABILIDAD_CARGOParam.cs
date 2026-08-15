using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO
    // por empresa, descriptor, identificador del catálogo (llave compuesta) o formato del descriptor (CORTO/EXTENSO).
    public class SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_RESPONSABILIDAD { get; set; }
        // Tipo de formato del descriptor (CORTO/EXTENSO) usado para filtrar qué responsabilidades mostrar.
        public string FORMATO { get; set; }
    }
}
