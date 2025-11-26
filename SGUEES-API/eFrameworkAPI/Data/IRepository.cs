using System.Collections.Generic;
using System.Threading.Tasks;
using eFrameworkAPI.Core;

namespace eFrameworkAPI.Data
{
    public interface IRepository
    {
        CResult<TData> GetAll<TData>(Dictionary<string, object> xWhere);
        CResult<TData> Get<TData>(Dictionary<string, object> xWhere);
        CResult<TData> Create<TEntity, TData>(TEntity Data, string vLOGIN_SISTEMA, string vESTACION);
        CResult<TData> Update<TEntity, TData>(TEntity Data, string vLOGIN_SISTEMA, string vESTACION);
        CResult<TData> Delete<TData>(Dictionary<string, object> xWhere, string vLOGIN_SISTEMA, string vESTACION);
    }
}
