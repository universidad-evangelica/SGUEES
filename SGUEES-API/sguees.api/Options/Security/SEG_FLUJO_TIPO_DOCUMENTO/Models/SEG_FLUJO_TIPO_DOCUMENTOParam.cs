using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_TIPO_DOCUMENTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_TIPO_DOCUMENTO { get; set; }
        public string NOMBRE_TIPO { get; set; }
        public string TABLA_ORIGEN { get; set; }
        public int OPCION_CONSULTA { get; set; } = 0; // 0=Todos, 1=Activos, 2=PorNombre, 3=PorTabla
    }
}