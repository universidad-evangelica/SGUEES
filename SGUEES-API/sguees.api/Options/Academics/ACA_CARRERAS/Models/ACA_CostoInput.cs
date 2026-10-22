using System;
using eFramework.Data;

namespace sguees.Models
{
    public class ACA_CostoInput : BaseEntity
    {
        public int CORR_COSTO { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_MONEDA { get; set; }
        public DateTime? FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public decimal MATRICULA_NACIONAL { get; set; }
        public decimal MATRICULA_EXTRANJERA { get; set; }
        public decimal INSCRIPCION { get; set; }
        public decimal INSCRIPCION_TUTORIA { get; set; }
        public decimal COSTO_CARNE { get; set; }
        public bool COBRA_DIFERENCIA_INSCRIPCION { get; set; }
        public string TIPO_IMPUESTO { get; set; } = "GRAVADO";
        public string REFERENCIA_FINANCIAMIENTO { get; set; }
        public decimal MONTO_FINANCIAMIENTO { get; set; }
        public decimal PORCENTAJE_RECUPERACION { get; set; }
        public decimal CARGO_CAMBIO_ASIGNATURA { get; set; }
        public string POLITICA_CARGO { get; set; } = "NUNCA";
        public string MODALIDAD_PAGO { get; set; } = "EFECTIVO";
        public string TIPO_COBRO_ASIGNATURA { get; set; } = "ASIGNATURA";
        public bool ACTIVO { get; set; } = true;
        public string VERSION { get; set; }
    }
}
