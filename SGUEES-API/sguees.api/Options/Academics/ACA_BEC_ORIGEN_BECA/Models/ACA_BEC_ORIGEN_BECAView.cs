using System;

namespace SGUEES.Models
{
    public class ACA_BEC_ORIGEN_BECAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ORIGEN_BECA { get; set; }
        public string CODIGO_ORIGEN { get; set; }
        public string NOMBRE_ORIGEN { get; set; }
        public string DESCRIPCION { get; set; }
        public bool? ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
