using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_COMPETENCIAS_TECNICASTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_COMPETENCIAS_TECNICAS { get; set; }
        public int? CORR_COMPETENCIAS_TECNICAS_PADRE { get; set; }
        public string CODIGO_COMPETENCIAS_TECNICAS { get; set; }
        public string NOMBRE_COMPETENCIAS_TECNICAS { get; set; }
        public string DESCRIPCION { get; set; }
        public string NIVEL { get; set; }
        public bool? ESTADO_COMPETENCIAS_TECNICAS { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
