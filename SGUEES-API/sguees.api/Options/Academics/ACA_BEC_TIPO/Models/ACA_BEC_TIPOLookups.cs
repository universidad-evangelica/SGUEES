using System;

namespace SGUEES.Models
{
    public class ACA_BEC_ORIGEN_BECALookup
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ORIGEN_BECA { get; set; }
        public string CODIGO_ORIGEN { get; set; }
        public string NOMBRE_ORIGEN { get; set; }
        public bool? ACTIVO { get; set; }
    }

    public class ACA_BEC_CONVENIOLookup
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_CONVENIO { get; set; }
        public string CODIGO_CONVENIO { get; set; }
        public string NOMBRE_CONVENIO { get; set; }
        public int CORR_ENTIDAD_FINANCIADORA { get; set; }
        public string NOMBRE_ENTIDAD { get; set; }
        public DateTime? FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public string ESTADO_CONVENIO { get; set; }
    }
}
