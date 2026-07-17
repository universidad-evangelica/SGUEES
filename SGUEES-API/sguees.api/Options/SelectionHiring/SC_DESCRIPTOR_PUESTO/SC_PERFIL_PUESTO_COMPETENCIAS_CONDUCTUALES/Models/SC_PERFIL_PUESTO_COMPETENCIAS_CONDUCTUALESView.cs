using System;

namespace SGUEES.Models
{
    // Proyección de lectura de competencia conductual del perfil.
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES { get; set; }
        public string NOMBRE_COMPETENCIAS_CONDUCTUALES { get; set; }
        public string DESCRIPCION { get; set; }
        public int? CORR_DESCRIPTOR_PUESTO { get; set; }
        public int? CORR_PERFIL_PUESTO { get; set; }
        public int? CORR_COMPETENCIAS_CONDUCTUALES { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string CODIGO_TIPO_PUESTO { get; set; }
    }
}
