using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.ACA_PROSPECTO_CONTACTO para la futura fase de edición.
    // Cómo lo hace: espejo de la tabla; la consulta actual solo lee V_ACA_PROSPECTO_CONTACTO.
    public class ACA_PROSPECTO_CONTACTOTable : BaseEntity
    {
        public int CORR_PROSPECTO_CONTACTO { get; set; }
        public int CORR_PROSPECTO_PERSONA { get; set; }
        public string CONTACTO { get; set; }
        public bool ES_PRINCIPAL { get; set; }
        public bool ES_TRABAJO { get; set; }
        public bool ES_TELEFONO { get; set; }
        public bool ES_CORREO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
