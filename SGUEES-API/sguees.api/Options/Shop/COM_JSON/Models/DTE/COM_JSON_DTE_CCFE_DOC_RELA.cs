namespace sguees.Models
{
    public class COM_JSON_DTE_CCFE_DOC_RELA
    {
        public string tipoDocumento { get; set; }               //Tipo de Documento Tributario Relacionado 
        public int tipoGeneracion { get; set; }                 //Tipo de Generación del Documento Tributario relacionado
        public string numeroDocumento { get; set; }             //Dirección complemento
        public string fechaEmision { get; set; }                //Fecha de Generación del Documento Relacionado
    }
}
