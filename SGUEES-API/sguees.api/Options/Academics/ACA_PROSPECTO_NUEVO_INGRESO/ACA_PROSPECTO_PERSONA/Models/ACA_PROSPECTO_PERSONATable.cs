using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_PERSONA para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_PERSONA.
    public class ACA_PROSPECTO_PERSONATable : BaseEntity
    {
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public string NOMBRES { get; set; }
        public string APELLIDO1 { get; set; }
        public string APELLIDO2 { get; set; }
        public string DUI { get; set; }
        public string NIE { get; set; }
        public string CARNET_RESIDENCIA { get; set; }
        public string NIT { get; set; }
        public DateTime? FECHA_NACIMIENTO { get; set; }
        public string LUGAR_NACIMIENTO { get; set; }
        public string PAIS_PROCEDENCIA { get; set; }
        public int? CORR_PAIS_PROCEDENCIA { get; set; }
        public int? CORR_PAIS_RESIDENCIA { get; set; }
        public int? GEN_PAIS_NACIONALIDAD { get; set; }
        public string IGLESIA_ACTUAL { get; set; }
        public int? CORR_RELIGION { get; set; }
        public bool TRABAJA { get; set; }
        public bool HA_SIDO_DEPORTADO { get; set; }
        public bool POSEE_DISCAPACIDAD { get; set; }
        public int? CORR_SEXO { get; set; }
        public int? CORR_ESTADO_CIVIL { get; set; }
        public int? CORR_TIPO_SANGRE { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public int? CORR_DEPTO_RESIDENCIA { get; set; }
        public int? CORR_MUNICIPIO_RESIDENCIA { get; set; }
        public string DIRECCION_ACTUAL { get; set; }
    }
}
