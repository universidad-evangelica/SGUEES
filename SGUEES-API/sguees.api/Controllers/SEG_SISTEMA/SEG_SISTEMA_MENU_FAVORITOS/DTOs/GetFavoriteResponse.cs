namespace csuees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.DTOs
{
    public class GetFavoriteResponse
    {
        public long CORR_FAVORITO_ID { get; set; } //long es equivalencia correcta para bigint en SQL Server
        public string PERMISSION_KEY { get; set; }
        public string MODULE_NAME { get; set; }
        public string ROUTE { get; set; }
        public int DISPLAY_ORDER { get; set; }
    }
}
