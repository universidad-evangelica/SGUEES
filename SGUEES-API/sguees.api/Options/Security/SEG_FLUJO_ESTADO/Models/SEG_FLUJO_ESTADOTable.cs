using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_ESTADOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ESTADO { get; set; }
        public int CORR_TIPO_DOCUMENTO { get; set; }
        public string NOMBRE_ESTADO { get; set; }
        public string DESCRIPCION { get; set; }
        public bool ES_INICIAL { get; set; }
        public bool ES_FINAL { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}