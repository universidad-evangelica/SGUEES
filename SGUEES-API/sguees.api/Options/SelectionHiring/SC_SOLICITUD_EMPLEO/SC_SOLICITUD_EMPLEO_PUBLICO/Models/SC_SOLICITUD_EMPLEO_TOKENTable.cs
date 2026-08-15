using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SC_SOLICITUD_EMPLEO_TOKENTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_TOKEN { get; set; }
        public int CORR_SOLICITUD_EMPLEO { get; set; }
        public string TOKEN_HASH { get; set; }
        public DateTime? FECHA_GENERACION { get; set; }
        public DateTime? FECHA_EXPIRACION { get; set; }
        public DateTime? FECHA_UTILIZACION { get; set; }
        public string ESTADO_TOKEN { get; set; }
        public string CORREO_DESTINO { get; set; }
    }
}
