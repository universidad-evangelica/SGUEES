namespace scuees.Models
{
    public class COM_JSON_DTE_FE_CUERPO
    {
        public int numItem { get; set; }                                //N° de ítem
        public int tipoItem { get; set; }                               //Tipo de ítem CAT-11
        public string numeroDocumento { get; set; }                     //Número de documento relacionado
        public decimal cantidad { get; set; }                            //Cantidad
        public string codigo { get; set; }                              //Código
        public string codTributo { get; set; }                          //Tributo sujeto a cálculo de IVA. CAT-15
        public int uniMedida { get; set; }                              //Unidad de Medida. CAT-14
        public string descripcion { get; set; }                         //Descripción
        public decimal precioUni { get; set; }                           //Precio Unitario
        public decimal montoDescu { get; set; }                          //Descuento, Bonificación, Rebajas por ítem
        public decimal ventaNoSuj { get; set; }                          //Ventas No Sujetas
        public decimal ventaExenta { get; set; }                         //Ventas Exentas
        public decimal ventaGravada { get; set; }                        //Ventas Gravadas
        public List<string> tributos { get; set; }                      //Código del Tributo. CAT-15
        public decimal psv { get; set; }                                 //Precio sugerido de venta
        public decimal noGravado { get; set; }
        public decimal ivaItem { get; set; }
    }
}
