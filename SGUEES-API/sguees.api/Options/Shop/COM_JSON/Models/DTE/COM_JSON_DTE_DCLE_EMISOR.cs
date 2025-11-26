namespace scuees.Models
{
    public class COM_JSON_DTE_DCLE_EMISOR
    {
        public string nit { get; set; }                         //NIT (Emisor)
        public string nrc { get; set; }                         // NRC (Emisor)
        public string nombre { get; set; }                      //Nombre, denominación o razón social del contribuyente (Emisor)
        public string codActividad { get; set; }                //Código de Actividad Económica (Emisor)
        public string descActividad { get; set; }               //Actividad Económica (Emisor)
        public string nombreComercial { get; set; }             //Nombre Comercial (Emisor)
        public string tipoEstablecimiento { get; set; }         //Tipo de establecimiento (Emisor). CAT-09 
        public COM_JSON_DTE_DIRECCION direccion { get; set; }                //Clase direccion
        public string telefono { get; set; }                    //Teléfono (Emisor)
        public string correo { get; set; }                      //Correo electrónico (Emisor)
        public string codigoMH { get; set; }                //Código del establecimiento asignado por el MH
        public string codigo { get; set; }                  //Código del establecimiento asignado por el contribuyente
        public string puntoVentaMH { get; set; }             //Código del Punto de Venta (Emisor) Asignado por el MH
        public string puntoVentaContri { get; set; }               //Código del Punto de Venta (Emisor) asignado por el contribuyente
    }
}
