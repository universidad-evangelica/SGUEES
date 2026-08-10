// Qué hace: lectura de V_PLA_PUESTO con nombres de gerencia, unidad, nivel y tipo.
// Cómo: proyecta el puesto más los textos descriptivos de los LEFT JOIN de la vista.
using System;

namespace SGUEES.Models
{
    public class PLA_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public int? CORR_GERENCIA { get; set; }
        public string NOMBRE_GERENCIA { get; set; }
        public int? CORR_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int? CORR_NIVEL_ACADEMICO { get; set; }
        public string NOMBRE_NIVEL_ACADEMICO { get; set; }
        public int? CORR_TIPO_PUESTO { get; set; }
        public string NOMBRE_TIPO_PUESTO { get; set; }
        public bool? ESTADO_PUESTO { get; set; }
        public bool? APROBACION_PUESTO { get; set; }
        public decimal? SALARIO_INICIAL { get; set; }
        public decimal? SALARIO_FINAL { get; set; }
        public string USUARIO_VALIDA { get; set; }
        public string USUARIO_AUTORIZA { get; set; }
        public string MISION_PUESTO { get; set; }
        public string OTROS_ASPECTOS { get; set; }
        public string CODIGO_PUESTO { get; set; }
        public string CODIGO_FORMATO { get; set; }
        public string VERSION_FORMATO { get; set; }
        public string USUARIO_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
    }
}
