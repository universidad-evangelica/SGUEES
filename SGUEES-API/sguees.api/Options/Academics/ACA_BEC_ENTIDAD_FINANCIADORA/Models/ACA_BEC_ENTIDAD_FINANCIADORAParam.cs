using eFramework.Data;

namespace SGUEES.Models
{
    public class ACA_BEC_ENTIDAD_FINANCIADORAParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ENTIDAD_FINANCIADORA { get; set; }
        public string CODIGO_ENTIDAD { get; set; }
        public string NOMBRE_ENTIDAD { get; set; }
        public string TIPO_ENTIDAD { get; set; }
        public bool? ACTIVO { get; set; }
    }
}
