using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_EMPLEO para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_EMPLEO.
    public class ACA_PROSPECTO_EMPLEOTable : BaseEntity
    {
        public int CORR_PROSPECTO_EMPLEO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public string EMPRESA { get; set; }
        public string CARGO { get; set; }
        public string DIRECCION { get; set; }
        public string TELEFONO { get; set; }
        public string EMAIL { get; set; }
        public int? CORR_SECTOR_LABORAL { get; set; }
        public int? CORR_PAIS { get; set; }
        public int? CORR_DEPTO { get; set; }
        public int? CORR_MUNICIPIO { get; set; }
        public bool? TRABAJA_AUN { get; set; }
        public bool? TIENE_EMPLEO_FUERA { get; set; }
        public decimal? SALARIO_MENSUAL { get; set; }
        public decimal? APORTE_LIQUIDO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
