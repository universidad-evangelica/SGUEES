using System.Threading.Tasks;
using eFramework.Data;
using scuees.Models;
using eFramework.Core;

namespace scuees.Repositories
{
    public interface ISEG_USUARIO_OPCIONRepository: IRepository<SEG_USUARIO_OPCIONTable>
    {
         Task<CResult> GetPermisosAsync(string LOGIN_SISTEMA,
                                        string CODIGO_SUITE);
    }
}
