using eFrameworkAPI.Core;

namespace eFrameworkAPI.Data
{
    public abstract class BaseRepository
    {
        public CData objData;

        protected BaseRepository(string xUrlAPI)
        {
            objData = new CData(xUrlAPI);
        }

    }
}
