using eFramework.Data;

namespace SGUEES.Models
{
    public class ACA_BEC_TIPOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_BECA { get; set; }
        public string CODIGO_BECA { get; set; }
        public string NOMBRE_BECA { get; set; }
        public int CORR_ORIGEN_BECA { get; set; }
        public int? CORR_CONVENIO { get; set; }
        public string ESTADO_BECA { get; set; }
        public bool? ACTIVO { get; set; }
        public int PAGE { get; set; } = 1;
        public int PAGE_SIZE { get; set; } = 10;
        public int OPCION_CONSULTA { get; set; } = 0;
        public string DISTINCT_FIELD { get; set; }
        public string HEADER_FILTER_SEARCH { get; set; }
        public string COLUMN_ANYOF_JSON { get; set; }
        public string FILTER_ROW_JSON { get; set; }
        public string COLUMN_EXACT_JSON { get; set; }
        public string SORT_FIELD { get; set; }
        public bool? SORT_DESC { get; set; }
    }
}
