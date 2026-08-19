using System;
namespace sguees.Models
{
    public class SC_PERSONA_FAMILIAR_UEESView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public int CORR_FAMILIAR_UEES { get; set; }
        public string NOMBRE { get; set; }
        public string PARENTESCO { get; set; }
        public string UNIDAD { get; set; }
        public string TELEFONO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
