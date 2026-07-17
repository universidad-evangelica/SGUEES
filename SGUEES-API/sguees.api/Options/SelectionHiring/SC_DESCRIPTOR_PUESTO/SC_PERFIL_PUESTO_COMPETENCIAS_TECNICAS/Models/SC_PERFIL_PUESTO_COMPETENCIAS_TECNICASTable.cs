using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Entidad de escritura de competencia técnica del perfil.
    public class SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS { get; set; }
        public string NOMBRE_COMPETENCIAS_TECNICAS { get; set; }
        public string DESCRIPCION { get; set; }
        // BASICO | INTERMEDIO | AVANZADO.
        public string NIVEL_DOMINIO { get; set; }
        public int? CORR_DESCRIPTOR_PUESTO { get; set; }
        public int? CORR_PERFIL_PUESTO { get; set; }
        public int? CORR_COMPETENCIAS_TECNICAS { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
