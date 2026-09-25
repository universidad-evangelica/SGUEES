namespace sguees.Models
{
    // Qué hace: fila del catálogo de códigos telefónicos de país que usa el registro del portal
    //           (NI_LIST_CATALOGS @Option = 21: CatalogId, CatalogCode, CatalogName = "+503 El Salvador").
    // Cómo lo hace: mismos nombres y tipos que la tabla temporal del SP para que FromDataReader los llene.
    //               Es la misma fuente del formulario de registro: mientras el código no viva en
    //               GEN_PAIS, el ERP lo lee de aquí y no de una copia.
    public class ACA_PROSPECTO_CONTACTO_CODIGO_PAISView
    {
        public int CatalogId { get; set; }
        public string CatalogCode { get; set; }
        public string CatalogName { get; set; }
    }
}
