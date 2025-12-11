namespace sguees.Models
{
    public class COM_JSON_DTE_FE_PAGO
    {
        public string codigo { get; set; }                      //Código de forma de pago. CAT-017
        public decimal montoPago { get; set; }                   //Monto por forma de pago
        public string referencia { get; set; }                  //Referencia de modalidad de pago
        public string plazo { get; set; } 
        public string periodo { get; set; }                     //Período de plazo   
    }
}
