using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_PERSONA (datos personales del prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_PERSONAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public string NOMBRES { get; set; }
        public string APELLIDO1 { get; set; }
        public string APELLIDO2 { get; set; }
        public string NOMBRE_COMPLETO { get; set; }
        public string DUI { get; set; }
        public string NIE { get; set; }
        public string CARNET_RESIDENCIA { get; set; }
        public string NIT { get; set; }
        public DateTime? FECHA_NACIMIENTO { get; set; }
        public int? EDAD { get; set; }
        public string LUGAR_NACIMIENTO { get; set; }
        public int? CORR_SEXO { get; set; }
        public string SEXO { get; set; }
        public int? CORR_ESTADO_CIVIL { get; set; }
        public string ESTADO_CIVIL { get; set; }
        public int? CORR_TIPO_SANGRE { get; set; }
        public string TIPO_SANGRE { get; set; }
        public int? CORR_PAIS_NACIONALIDAD { get; set; }
        public string NACIONALIDAD { get; set; }
        public int? CORR_PAIS_PROCEDENCIA { get; set; }
        public string PAIS_PROCEDENCIA { get; set; }
        public int? CORR_PAIS_RESIDENCIA { get; set; }
        public string PAIS_RESIDENCIA { get; set; }
        public int? CORR_DEPTO_RESIDENCIA { get; set; }
        public string DEPTO_RESIDENCIA { get; set; }
        public int? CORR_MUNICIPIO_RESIDENCIA { get; set; }
        public string MUNICIPIO_RESIDENCIA { get; set; }
        public string DIRECCION_ACTUAL { get; set; }
        public int? CORR_RELIGION { get; set; }
        public string RELIGION { get; set; }
        public string IGLESIA_ACTUAL { get; set; }
        public bool TRABAJA { get; set; }
        public bool HA_SIDO_DEPORTADO { get; set; }
        public bool POSEE_DISCAPACIDAD { get; set; }
    }
}
