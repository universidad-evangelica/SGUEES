<<<<<<< HEAD
﻿using sguees.api.Controllers;
using sguees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.Service;

namespace sguees.api.Data
=======
﻿using csuees.api.Controllers;
using csuees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.Service;

namespace csuees.api.Data
>>>>>>> 454bd78 (Rediseño general aplicativo SGUEES#31)
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
