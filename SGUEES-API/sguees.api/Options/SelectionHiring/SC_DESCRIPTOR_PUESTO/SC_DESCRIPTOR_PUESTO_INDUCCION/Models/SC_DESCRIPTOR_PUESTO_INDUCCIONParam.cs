using eFramework.Data;

namespace SGUEES.Models
{
    // Qué hace: filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_PUESTO_INDUCCION por
    // empresa, descriptor o identificador de la inducción del catálogo (llave compuesta).
    public class SC_DESCRIPTOR_PUESTO_INDUCCIONParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_INDUCCION { get; set; }
    }
}
