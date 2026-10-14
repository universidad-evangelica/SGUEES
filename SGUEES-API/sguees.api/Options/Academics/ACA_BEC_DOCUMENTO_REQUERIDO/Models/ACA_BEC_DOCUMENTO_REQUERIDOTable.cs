using System;
using eFramework.Data;

namespace SGUEES.Models
{
    public class ACA_BEC_DOCUMENTO_REQUERIDOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_BECA_DOCUMENTO_REQUERIDO { get; set; }
        public int CORR_BECA { get; set; }
        public string NOMBRE_DOCUMENTO { get; set; }
        public string AREA_RECEPTORA { get; set; }
        public bool OBLIGATORIO { get; set; } = true;
        public bool ACTIVO { get; set; } = true;
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}

