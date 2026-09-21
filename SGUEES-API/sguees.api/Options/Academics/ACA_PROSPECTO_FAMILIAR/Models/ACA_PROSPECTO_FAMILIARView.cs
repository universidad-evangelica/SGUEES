using System;

namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_FAMILIAR (familiares y contacto de emergencia del prospecto).
    // Cómo lo hace: cada tipo coincide exacto con la vista (smallint → short, tinyint → byte);
    //               eFramework asigna sin convertir y un tipo distinto deja el valor en su default.
    public class ACA_PROSPECTO_FAMILIARView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PROSPECTO_FAMILIAR { get; set; }
        public int CORR_PARENTESCO { get; set; }
        public string NOMBRE_PARENTESCO { get; set; }
        public string NOMBRE_COMPLETO { get; set; }
        public bool? TRABAJA { get; set; }
        public string PROFESION { get; set; }
        public string OCUPACION { get; set; }
        public string NOMBRE_EMPRESA { get; set; }
        public string TELEFONO_TRABAJO { get; set; }
        public string DIRECCION_TRABAJO { get; set; }
        public string DIRECCION_CASA { get; set; }
        public string TELEFONO { get; set; }
        public string TELEFONO2 { get; set; }
        public bool? VIVE_CON_EL { get; set; }
        public bool? FINANCIA_ESTUDIOS { get; set; }
        public bool? ACTIVO { get; set; }
        public bool? ES_EMERGENCIA { get; set; }
        public string DIRECCION_EMERGENCIA { get; set; }
        public string TELEFONO_EMERGENCIA { get; set; }
        public bool? ES_NUCLEO { get; set; }
        public bool? ES_SOLO_EMERGENCIA { get; set; }
    }
}
