using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_COMPETENCIAS_TECNICASParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_COMPETENCIAS_TECNICAS { get; set; }
        public int? CORR_COMPETENCIAS_TECNICAS_PADRE { get; set; }
        public string BUSQUEDA { get; set; }
        public string CODIGO_COMPETENCIAS_TECNICAS { get; set; }
        public string NOMBRE_COMPETENCIAS_TECNICAS { get; set; }
        public string DESCRIPCION { get; set; }
        public string NIVEL { get; set; }
        public string NIVEL_PADRE { get; set; }
        public bool? ESTADO_COMPETENCIAS_TECNICAS { get; set; }
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
