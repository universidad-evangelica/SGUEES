using eFramework.Data;

namespace SGUEES.Models
{
    /// <summary>Parámetros GetAll (A+P) y Get por PK. Sin filtros remotos legacy.</summary>
    // Filtros, paginación y parámetros de consulta del catálogo de impacto económico.
    public class SC_IMPACTO_ECONOMICOParam : BaseParam
    {
        // Empresa de la sesión que aísla los datos del catálogo.
        public int CORR_EMPRESA { get; set; }
        public int CORR_IMPACTO_ECONOMICO { get; set; }

        // Número de página solicitado por la grilla (1-based).
        public int PAGE { get; set; } = 1;
        // Tamaño de página; 0 indica devolver todos los registros.
        public int PAGE_SIZE { get; set; } = 10;
        // Campo por el que se ordena el resultado de la grilla.
        public string SORT_FIELD { get; set; }
        // Indica si el ordenamiento es descendente.
        public bool? SORT_DESC { get; set; }
    }
}
