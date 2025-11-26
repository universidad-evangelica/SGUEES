namespace scuees.Models
{
    public class COM_JSON_DTE_DCLE
    {
        public COM_JSON_DTE_DCLE_IDENTIFICA identificacion { get; set; }             //Identificación
        public COM_JSON_DTE_DCLE_EMISOR emisor { get; set; }                         //Emisor del documento 
        public COM_JSON_DTE_DCLE_RECEPTOR receptor { get; set; }                    //Receptor del documento
        public COM_JSON_DTE_DCLE_CUERPO cuerpoDocumento { get; set; }        //Cuerpo del Documento
        public COM_JSON_DTE_EXTENSION extension { get; set; }                        //Extensión
        public List<COM_JSON_DTE_APENDICE> apendice { get; set; }                   //Apendice
        public string selloRecibido { get; set; }                                  //Sello Recibido
        public string firmaElectronica { get; set; }                              //Firma Electrónica
        public COM_JSON_DTE_DCLE_RESPUESTA_MH ResponseMH { get; set; }            //Respuesta del Ministerio de Hacienda
    }
}
