using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_FRECUENCIAParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_FRECUENCIA { get; set; }
        public string BUSQUEDA { get; set; }
        public string NOMBRE_FRECUENCIA { get; set; }
        public bool? ESTADO_FRECUENCIA { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public string FECHA_ACTU { get; set; }
        public int PAGE { get; set; } = 1;
        public int PAGE_SIZE { get; set; } = 10;
        public int OPCION_CONSULTA { get; set; } = 0;
    }
}
