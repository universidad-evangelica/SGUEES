using eFramework.Data;

namespace SGUEES.Models
{
    public class ACA_BEC_REQUISITOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_BECA_REQUISITO { get; set; }
        public int CORR_BECA { get; set; }
        public string NOMBRE_REQUISITO { get; set; }
        public bool? OBLIGATORIO { get; set; }
        public bool? ACTIVO { get; set; }
    }
}
