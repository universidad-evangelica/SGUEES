using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;

namespace eFramework.Data
{
    public abstract class BaseRepository<TEntity> where TEntity : BaseEntity
    {
        public CData objData;
        
        protected BaseRepository(string connectionString, string providerName)
        {
            objData = new CData(connectionString, providerName);
        }

        /// <summary>Helper A+P — lectura paginada sobre vista vía eFramework.</summary>
        protected async Task<CPagedResult<TView>> ReadPagedViewAsync<TView>(
            string viewName,
            List<CParameter> xWhere,
            string[] allowedSortFields,
            string defaultSortField = null,
            int maxPageSize = 200)
            where TView : new()
        {
            return await objData.GetPagedFromViewAsync<TView>(
                viewName,
                xWhere,
                allowedSortFields,
                defaultSortField,
                maxPageSize);
        }
    }
}
