using eFramework.Data;
namespace sguees.Models
{
    public class ACA_CARRERAS_SEDESTable : BaseEntity
    {
        // Empresa es contexto autenticado; la tabla puente no tiene esa columna.
        public int CORR_EMPRESA { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_SEDE { get; set; }
    }
}
