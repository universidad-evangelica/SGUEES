// Qué hace: DTO de lectura de competencia técnica.
// Cómo: proyecta los campos expuestos por la vista SQL V_SC_COMPETENCIAS_TECNICAS, incluidos datos de padre y nivel 1.
using System;

namespace SGUEES.Models
{
    // Qué hace: modelo de consulta de competencia técnica.
    // Cómo: agrupa correlativos, código, nombre, definición, nivel, estado, auditoría y columnas de jerarquía.
    public class SC_COMPETENCIAS_TECNICASView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_COMPETENCIAS_TECNICAS { get; set; }
        public int? CORR_COMPETENCIAS_TECNICAS_PADRE { get; set; }
        public string CODIGO_COMPETENCIAS_TECNICAS { get; set; }
        public string NOMBRE_COMPETENCIAS_TECNICAS { get; set; }
        public string DESCRIPCION { get; set; }
        public string NIVEL { get; set; }
        public bool? ESTADO_COMPETENCIAS_TECNICAS { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string CODIGO_PADRE { get; set; }
        public string NOMBRE_PADRE { get; set; }
        public string DESCRIPCION_PADRE { get; set; }
        public string NIVEL_PADRE { get; set; }
        public string CODIGO_NIV1 { get; set; }
        public string NOMBRE_NIV1 { get; set; }
    }
}
