using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_EMPLEO (información laboral del prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_EMPLEOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO_EMPLEO { get; set; }
        public string EMPRESA { get; set; }
        public string CARGO { get; set; }
        public string DIRECCION { get; set; }
        public string TELEFONO { get; set; }
        public string EMAIL { get; set; }
        public int? CORR_SECTOR_LABORAL { get; set; }
        public string SECTOR_LABORAL { get; set; }
        public int? CORR_PAIS { get; set; }
        public string NOMBRE_PAIS { get; set; }
        public int? CORR_DEPTO { get; set; }
        public string NOMBRE_DEPTO { get; set; }
        public int? CORR_MUNICIPIO { get; set; }
        public string NOMBRE_MUNICIPIO { get; set; }
        public bool? TRABAJA_AUN { get; set; }
        public bool? TIENE_EMPLEO_FUERA { get; set; }
        public decimal? SALARIO_MENSUAL { get; set; }
        public decimal? APORTE_LIQUIDO { get; set; }
    }
}
