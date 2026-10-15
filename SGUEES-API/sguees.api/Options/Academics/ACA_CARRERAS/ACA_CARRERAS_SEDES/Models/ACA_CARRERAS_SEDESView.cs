using System;
namespace sguees.Models
{
    public class ACA_CARRERAS_SEDESView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_SEDE { get; set; }
        public string CODIGO_SEDE { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public string ESTADO_SEDE { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
    public class ACA_SEDES_CARRERA_LOOKUPView
    {
        public int Key { get; set; }
        public string Value { get; set; }
        public bool HABILITADA { get; set; }
        public string MOTIVO { get; set; }
    }
}
