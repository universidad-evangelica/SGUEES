using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_PUESTO por empresa e identificador.
    public class SC_DESCRIPTOR_PUESTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        /// <summary>Filtro para lookup de sc-requisicion-personal (descriptores por unidad).</summary>
        public int CORR_UNIDAD { get; set; }
        /// <summary>Login de sesión: GetAll filtra por unidades de PRAL_DATA_SC_UNIDADES_USUARIO.</summary>
        public string LOGIN_SISTEMA { get; set; }
    }
}
