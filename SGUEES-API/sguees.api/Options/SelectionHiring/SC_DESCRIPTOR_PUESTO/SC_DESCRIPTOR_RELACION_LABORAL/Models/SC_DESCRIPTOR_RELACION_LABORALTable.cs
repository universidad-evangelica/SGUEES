using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de escritura de la tabla SC_DESCRIPTOR_RELACION_LABORAL: relaciones laborales internas/externas
    // (con otros puestos o áreas) asociadas a un descriptor de puesto.
    public class SC_DESCRIPTOR_RELACION_LABORALTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de esta relación laboral.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_RELACION_LABORAL { get; set; }
        // Tipo de relación, por ejemplo INTERNA o EXTERNA.
        public string TIPO_RELACION { get; set; }
        // Puesto o área con el que se establece la relación laboral.
        public string PUESTO_AREA { get; set; }
        public string MOTIVO_RELACION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
