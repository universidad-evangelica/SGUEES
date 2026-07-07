using eFramework.Data;

namespace SGUEES.Models
{
    /// <summary>Parámetros GetAll (A+P) y Get por PK. Sin filtros remotos legacy.</summary>
    public class SC_IMPACTO_ECONOMICOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_IMPACTO_ECONOMICO { get; set; }

        public int PAGE { get; set; } = 1;
        public int PAGE_SIZE { get; set; } = 10;
        public string SORT_FIELD { get; set; }
        public bool? SORT_DESC { get; set; }
    }
}
