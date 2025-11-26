namespace scuees.Models
{
    public class COM_JSON_DTE_FE
    {
        public COM_JSON_DTE_CCFE_IDENTIFICA identificacion { get; set; }             //Identificación
        public List<COM_JSON_DTE_CCFE_DOC_RELA> documentoRelacionado { get; set; }   //Documentos Relacionados
        public COM_JSON_DTE_CCFE_EMISOR emisor { get; set; }                         //Emisor del documento 
        public COM_JSON_DTE_FE_RECEPTOR receptor { get; set; }
        public object otrosDocumentos { get; set; }                             //Documentos Asociados
        public COM_JSON_DTE_CCFE_TERCERO ventaTercero { get; set; }                  //Documentos de Terceros
        public List<COM_JSON_DTE_FE_CUERPO> cuerpoDocumento { get; set; }
        public COM_JSON_DTE_FE_RESUMEN resumen { get; set; }                       //Resumen
        public COM_JSON_DTE_EXTENSION extension { get; set; }                        //Extensión
        public List<COM_JSON_DTE_APENDICE> apendice { get; set; }   
        public string selloRecibido { get; set; }
        public string firmaElectronica { get; set; }
    }
}
