<<<<<<< HEAD
﻿namespace sguees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.DTOs
=======
﻿namespace csuees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.DTOs
>>>>>>> 454bd78 (Rediseño general aplicativo SGUEES#31)
{
    public class ToggleFavoriteRequest
    {
        public int CORR_EMPRESA { get; set; }

        public string USUARIO { get; set; }

        public string PERMISSION_KEY { get; set; }

        public string MODULE_NAME { get; set; }

        public string ROUTE { get; set; }
    }
}
