using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_FAMILIAR para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_FAMILIAR.
    public class ACA_PROSPECTO_FAMILIARTable : BaseEntity
    {
        public int CORR_PROSPECTO_FAMILIAR { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public int CORR_PARENTESCO { get; set; }
        public string NOMBRES { get; set; }
        public string APELLIDO1 { get; set; }
        public string APELLIDO2 { get; set; }
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
        public bool? ACTIVO { get; set; }
        public bool? ES_EMERGENCIA { get; set; }
        public string DIRECCION_EMERGENCIA { get; set; }
        public string TELEFONO_EMERGENCIA { get; set; }
        public bool? FINANCIA_ESTUDIOS { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
