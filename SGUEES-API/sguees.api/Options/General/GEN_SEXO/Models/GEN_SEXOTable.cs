using System;
using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: columnas de dbo.GEN_SEXO.
    // Cómo lo hace: espejo de la tabla; hoy esta carpeta solo expone el combo de prospectos.
    public class GEN_SEXOTable : BaseEntity
    {
        public int CORR_SEXO { get; set; }
        public string NOMBRE { get; set; }
        public string DESCRIPCION { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
