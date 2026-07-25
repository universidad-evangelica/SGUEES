using System;
using eFramework.Data;

namespace sguees.Models
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string CODIGO_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int CORR_NIVEL { get; set; }
        public int OPCION_CONSULTA { get; set; } = 0; // 0=Todos, 1=Activos, 2=PorNivel
    }
}