namespace scuees.Models
{
    public class COM_JSON_DTE_FE_RESUMEN
    {
        public decimal totalNoSuj { get; set; }                          //Total de Operaciones no sujetas
        public decimal totalExenta { get; set; }                         //Total de Operaciones Exentas
        public decimal totalGravada { get; set; }                        //Total de Operaciones Gravadas
        public decimal subTotalVentas { get; set; }                      //Suma de operaciones sin impuestos
        public decimal descuNoSuj { get; set; }                          //Monto global de Descuento, Bonificación, Rebajas y otros a ventas no sujetas
        public decimal descuExenta { get; set; }                         //Monto de Descuento, Bonificación, Rebajas y otros a ventas exentas
        public decimal descuGravada { get; set; }                        //Monto de Descuento, Bonificación, Rebajas y otros a ventas gravadas
        public decimal porcentajeDescuento { get; set; }                 //Porcentaje del monto global de Descuento, Bonificación, Rebajas y otros
        public decimal totalDescu { get; set; }                          //Total del monto de Descuento, Bonificación, Rebajas
        public List<COM_JSON_DTE_TRIBUTO> tributos { get; set; }             //Resumen de Tributos
        public decimal subTotal { get; set; }                            //Sub-Total
        public decimal ivaRete1 { get; set; }                            //IVA Retenido
        public decimal reteRenta { get; set; }                           //Retención Renta
        public decimal montoTotalOperacion { get; set; }                 //Monto Total de la Operación
        public decimal totalNoGravado { get; set; }                      //Total Cargos/Abonos que no afectan la base imponible
        public decimal totalPagar { get; set; }                          //Total a Pagar
        public string totalLetras { get; set; }                         //Valor en Letras
        public decimal totalIva { get; set; }
        public decimal saldoFavor { get; set; }                          //Saldo a Favor
        public int condicionOperacion { get; set; }                     //Condición de la Operación
        public List<COM_JSON_DTE_FE_PAGO> pagos { get; set; }                           //Pagos
        public string numPagoElectronico { get; set; }
        
    }
}
