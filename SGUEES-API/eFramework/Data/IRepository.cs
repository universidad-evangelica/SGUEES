using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;

namespace eFramework.Data
{
    public interface IRepository<TEntity> where TEntity : BaseEntity
    {
        Task<CResult> GetAllAsync(List<CParameter> xWhere);
        Task<CResult> GetAsync(List<CParameter> xWhere);
        Task<CResult> CreateAsync(TEntity Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(TEntity Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(TEntity Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
