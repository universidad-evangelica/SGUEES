using csuees.api.Controllers;
using csuees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.Service;

namespace csuees.api.Data
{
    public class ApplicationDataContext
    {
        //Llamo e inicializo servicio Menu Favoritos
        public SEG_SISTEMA_MENU_FAVORITOSService MenuFavoritos { get; set; }

        public ApplicationDataContext(IConfiguration configuration)
        {
            MenuFavoritos = new SEG_SISTEMA_MENU_FAVORITOSService(configuration);
        }

    }
}
