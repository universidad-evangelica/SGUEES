using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_TIPO_NOTIFICACIONTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_TIPO_NOTIFICACION { get; set; }
        public byte CODIGO_TIPO { get; set; }
        public string NOMBRE_TIPO { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}