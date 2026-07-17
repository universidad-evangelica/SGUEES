using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta de responsabilidades del cargo (incluye FORMATO).
    public class SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_DESCRIPTOR_RESPONSABILIDAD { get; set; }
        // Filtra por aplicabilidad CORTO/EXTENSO/AMBOS.
        // Filtra listados por aplicabilidad CORTO/EXTENSO/AMBOS.
        public string FORMATO { get; set; }
    }
}
