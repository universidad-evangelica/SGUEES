using System;

namespace SGUEES.Models
{
    public class ACA_BEC_REQUISITOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_BECA_REQUISITO { get; set; }
        public int CORR_BECA { get; set; }
        public string CODIGO_BECA { get; set; }
        public string NOMBRE_BECA { get; set; }
        public string NOMBRE_REQUISITO { get; set; }
        public string DESCRIPCION { get; set; }
        public bool OBLIGATORIO { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
