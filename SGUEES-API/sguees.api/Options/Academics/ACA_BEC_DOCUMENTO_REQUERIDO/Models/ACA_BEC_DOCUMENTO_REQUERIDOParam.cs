using eFramework.Data;

namespace SGUEES.Models
{
    public class ACA_BEC_DOCUMENTO_REQUERIDOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_BECA_DOCUMENTO_REQUERIDO { get; set; }
        public int CORR_BECA { get; set; }
        public string NOMBRE_DOCUMENTO { get; set; }
        public string AREA_RECEPTORA { get; set; }
        public bool? OBLIGATORIO { get; set; }
        public bool? ACTIVO { get; set; }
    }
}

