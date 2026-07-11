using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_PROCESOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FLUJO_PROCESO { get; set; }
        public int CORR_TIPO_DOCUMENTO { get; set; }
        public string NOMBRE_FLUJO { get; set; }
        public int OPCION_CONSULTA { get; set; } = 0; // 0=Todos, 1=Activos, 2=PorTipoDocumento
    }
}