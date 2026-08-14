// Qué hace: lectura de V_GEN_UNIDADES_PUESTO con nombres de unidad y puesto.
// Cómo: proyecta la asignación intermedia más códigos/nombres de catálogo.
using System;

namespace SGUEES.Models
{
    public class GEN_UNIDADES_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string CODIGO_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int CORR_PUESTO { get; set; }
        public string CODIGO_PUESTO { get; set; }
        public string NOMBRE_PUESTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
