using System;

namespace scuees.Models
{
  public class SEG_USUARIO_OPCIONParam
  {
    public Int32 TIPO_CONSULTA { get; set; }
    public String LOGIN_SISTEMA { get; set; }
    public Int32 CORR_SUSCRIPCION { get; set; } = 1;
    public Int32 CORR_CONFI_PAIS { get; set; } = 1;
    public String CODIGO_SISTEMA { get; set; }
    public String CODIGO_MENU { get; set; }
    public String CODIGO_OPCION { get; set; }
    public String CODIGO_SUITE { get; set; } = "e-AdminWeb";
    public Int32 OPCION_CONSULTA { get; set; }
  }
}
