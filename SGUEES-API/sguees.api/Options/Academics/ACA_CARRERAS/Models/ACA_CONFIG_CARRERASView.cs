using System;

namespace sguees.Models
{
    public class ACA_CONFIG_CARRERASView
    {
        public int CORR_CARRERA { get; set; }
        public int CORR_EMPRESA { get; set; }
        public int CORR_FACULTAD { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int? CORR_GRADO_ACADEMICO { get; set; }
        public string CODIGO_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public short MAX_REPETICIONES { get; set; }
        public decimal? CREDITOS_REQUERIDOS { get; set; }
        public decimal? NOTA_MINIMA { get; set; }
        public string NOMBRE_AREA { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public string NOMBRE_GRADO { get; set; }
        public int? CORR_DECANO { get; set; }
        public string NOMBRE_DECANO { get; set; }
        public string SEDES_ACTIVAS { get; set; }
    }
}
