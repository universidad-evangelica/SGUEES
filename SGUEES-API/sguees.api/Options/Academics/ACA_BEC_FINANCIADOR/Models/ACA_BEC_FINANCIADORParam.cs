using eFramework.Data;

namespace SGUEES.Models
{
    public class ACA_BEC_FINANCIADORParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_BECA_FINANCIADOR { get; set; }
        public int CORR_BECA { get; set; }
        public int CORR_ENTIDAD_FINANCIADORA { get; set; }
        public string CONCEPTO_COBERTURA { get; set; }
        public bool? ACTIVO { get; set; }
    }
}
