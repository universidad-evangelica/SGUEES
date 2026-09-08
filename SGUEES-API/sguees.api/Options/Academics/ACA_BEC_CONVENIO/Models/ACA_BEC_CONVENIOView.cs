using System;

namespace SGUEES.Models
{
    public class ACA_BEC_CONVENIOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_CONVENIO { get; set; }
        public string CODIGO_CONVENIO { get; set; }
        public string NOMBRE_CONVENIO { get; set; }
        public int CORR_ENTIDAD_FINANCIADORA { get; set; }
        public string CODIGO_ENTIDAD { get; set; }
        public string NOMBRE_ENTIDAD { get; set; }
        public string TIPO_ENTIDAD { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public string DESCRIPCION { get; set; }
        public string ESTADO_CONVENIO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
