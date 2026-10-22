using System;

namespace sguees.Models
{
    public class ACA_CONFIG_COSTOSView
    {
        public int CORR_COSTO { get; set; }
        public int CORR_EMPRESA { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_SEDE { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public int CORR_MONEDA { get; set; }
        public decimal MATRICULA_NACIONAL { get; set; }
        public decimal MATRICULA_EXTRANJERA { get; set; }
        public decimal INSCRIPCION { get; set; }
        public decimal INSCRIPCION_TUTORIA { get; set; }
        public decimal COSTO_CARNE { get; set; }
        public bool COBRA_DIFERENCIA_INSCRIPCION { get; set; }
        public string TIPO_IMPUESTO { get; set; }
        public string REFERENCIA_FINANCIAMIENTO { get; set; }
        public decimal MONTO_FINANCIAMIENTO { get; set; }
        public decimal PORCENTAJE_RECUPERACION { get; set; }
        public decimal CARGO_CAMBIO_ASIGNATURA { get; set; }
        public string POLITICA_CARGO { get; set; }
        public string MODALIDAD_PAGO { get; set; }
        public string TIPO_COBRO_ASIGNATURA { get; set; }
        public bool ACTIVO { get; set; }
        public byte[] VERSION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public string NOMBRE_MONEDA { get; set; }
    }
}
