using eFramework.Data;

namespace SGUEES.Models
{
    public class ACA_BEC_CONVENIOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_CONVENIO { get; set; }
        public string CODIGO_CONVENIO { get; set; }
        public string NOMBRE_CONVENIO { get; set; }
        public int CORR_ENTIDAD_FINANCIADORA { get; set; }
        public string ESTADO_CONVENIO { get; set; }
    }
}

