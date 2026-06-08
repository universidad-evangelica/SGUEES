using eFramework.Data;

<<<<<<< HEAD
namespace sguees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.Models
=======
namespace csuees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.Models
>>>>>>> 454bd78 (Rediseño general aplicativo SGUEES#31)
{
    //Esta es la tabla completa, mi modelo.
    public class SEG_SISTEMA_MENU_FAVORITOSTable
    {
        public long CORR_FAVORITO_ID { get; set; }

        public int CORR_EMPRESA { get; set; }

        public string USUARIO { get; set; }

        public string PERMISSION_KEY { get; set; }

        public string MODULE_NAME { get; set; }

        public string ROUTE { get; set; }

        public int DISPLAY_ORDER { get; set; }

        public DateTime FECHA_CREACION { get; set; }
    }
}
