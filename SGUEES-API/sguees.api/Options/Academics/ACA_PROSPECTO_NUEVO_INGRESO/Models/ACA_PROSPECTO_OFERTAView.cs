namespace sguees.Models
{
    // Qué hace: opción de carrera o de modalidad que el prospecto puede elegir en su ciclo.
    // Cómo lo hace: misma forma para los dos catálogos (código + nombre), como los devuelve el portal
    //               de admisiones en NI_LIST_CATALOGS (opciones 5 y 6), para que el ERP ofrezca
    //               exactamente lo mismo que el formulario del aspirante.
    public class ACA_PROSPECTO_OFERTAView
    {
        public int CORR { get; set; }
        public string CODIGO { get; set; }
        public string NOMBRE { get; set; }
    }
}
