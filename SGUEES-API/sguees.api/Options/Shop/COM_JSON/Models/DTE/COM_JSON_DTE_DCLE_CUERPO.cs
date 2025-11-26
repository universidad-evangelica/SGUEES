namespace scuees.Models
{
    public class COM_JSON_DTE_DCLE_CUERPO
    {
        public string periodoLiquidacionFechaInicio { get; set; }      //Fecha de inicio del periodo de liquidación
        public string periodoLiquidacionFechaFin { get; set; }         //Fecha de fin del periodo de liquidación
        public string codLiquidacion { get; set; }                    //Código de Liquidación
        public decimal cantidadDoc { get; set; }             //Cantidad de Documentos
        public decimal valorOperaciones { get; set; }       //Valor de las Operaciones
        public decimal montoSinPercepcion { get; set; }    //Monto sin Percepción
        public string descripSinPercepcion { get; set; }  //Descripción del monto no sujeto a percepción
        public decimal subTotal { get; set; }           //Subtotal
        public decimal iva { get; set; }              //IVA
        public decimal montoSujetoPercepcion { get; set; } //Monto Sujeto a Percepción
        public decimal ivaPercibido { get; set; }       //IVA Percibido
        public decimal comision { get; set; }         //Comisión
        public decimal porcentComision { get; set; } //Porcentaje de Comisión
        public decimal ivaComision { get; set; }   //IVA de la Comisión
        public decimal liquidoApagar { get; set; } //Líquido a Pagar
        public string totalLetras { get; set; }  //Total en Letras
        public string observaciones { get; set; } //Observaciones

    }
}
