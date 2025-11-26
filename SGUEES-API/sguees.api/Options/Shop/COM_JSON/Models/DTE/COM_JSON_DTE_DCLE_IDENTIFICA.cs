namespace scuees.Models
{
    public class COM_JSON_DTE_DCLE_IDENTIFICA
    {
        public int version { get; set; }                        //Versión. Constante 3
        public string ambiente { get; set; }                    //Ambiente de destino. CAT-01
        public string tipoDte { get; set; }                     //Tipo de Documento. CAT-02
        public string numeroControl { get; set; }               //Número de Control."^DTE-03-[A-Z0-9]{8}-[0-9]{15}$"
        public string codigoGeneracion { get; set; }            //Código de Generación.
        public int tipoModelo { get; set; }                     //Modelo de Facturación. CAT-03
        public int tipoOperacion { get; set; }                  //Tipo de Transmisión. CAT-04
        public int? tipoContingencia { get; set; }            //Tipo de Contingencia. CAT-05
        public string motivoContin { get; set; }                //Motivo de Contingencia.
        public string fecEmi { get; set; }                      //Fecha de Generación
        public string horEmi { get; set; }                      //Hora de Generación
        public string tipoMoneda { get; set; }                  //Tipo de Moneda. USD
    }
}
