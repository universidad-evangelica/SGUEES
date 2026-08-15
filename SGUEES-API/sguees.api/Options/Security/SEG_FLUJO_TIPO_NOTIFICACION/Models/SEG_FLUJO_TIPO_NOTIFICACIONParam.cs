using eFramework.Data;

namespace sguees.Models
{
    public class SEG_FLUJO_TIPO_NOTIFICACIONParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_TIPO_NOTIFICACION { get; set; }
        public byte CODIGO_TIPO { get; set; }
        public int OPCION_CONSULTA { get; set; } = 0;
    }
}