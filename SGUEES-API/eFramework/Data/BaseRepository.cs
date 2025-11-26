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

    }
}
