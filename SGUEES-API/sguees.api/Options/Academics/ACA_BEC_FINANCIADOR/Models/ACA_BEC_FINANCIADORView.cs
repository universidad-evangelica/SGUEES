using System;

namespace SGUEES.Models
{
    public class ACA_BEC_FINANCIADORView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_BECA_FINANCIADOR { get; set; }
        public int CORR_BECA { get; set; }
        public string CODIGO_BECA { get; set; }
        public string NOMBRE_BECA { get; set; }
        public int CORR_ENTIDAD_FINANCIADORA { get; set; }
        public string CODIGO_ENTIDAD { get; set; }
        public string NOMBRE_ENTIDAD { get; set; }
        public string TIPO_ENTIDAD { get; set; }
        public string CONCEPTO_COBERTURA { get; set; }
        public decimal PORCENTAJE_COBERTURA { get; set; }
        public decimal? MONTO_MAXIMO { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
