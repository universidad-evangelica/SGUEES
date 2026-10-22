using System;

namespace sguees.Models
{
    public class ACA_CICLOS_CABECERAView
    {
        public int CORR_CICLO_ACADEMICO { get; set; }
        public int CORR_EMPRESA { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public short ANIO { get; set; }
        public byte NUMERO_PERIODO { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime FECHA_FIN { get; set; }
        public DateTime FECHA_INICIO_INSCRIPCION { get; set; }
        public DateTime FECHA_FIN_INSCRIPCION { get; set; }
        public string ESTADO { get; set; }
        public bool REQUIERE_REVISION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string NOMBRE_AREA { get; set; }
        public string NOMBRES_SEDES { get; set; }
        public string NOMBRES_FACULTADES_SEDES { get; set; }
        public int? SEDES { get; set; }
        public int? FACULTADES_SEDES { get; set; }
        public int? CARRERAS_SEDES { get; set; }
    }
}
