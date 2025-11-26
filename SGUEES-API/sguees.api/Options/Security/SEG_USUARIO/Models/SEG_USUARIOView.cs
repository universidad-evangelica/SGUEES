using scuees.api.Shared;

namespace scuees.Models
{
  public class SEG_USUARIOView
  {
    public string LOGIN_SISTEMA { get; set; }
    public string NOMBRE_USUARIO { get; set; }
    public byte[] CLAVE_USUARIO { get; set; }
    public byte[] CLAVE_USUARIO_SAL { get; set; }
    public string CORREO_ELECTRONICO { get; set; }
    public UserType TIPO_USUARIO { get; set; }
    public string NOMBRE_TIPO_USUARIO { get; set; }
    public UserStatus ESTADO_USUARIO { get; set; }
    public string NOMBRE_ESTADO_USUARIO { get; set; }
    public string IDIOMA { get; set; }
    public string USUARIO_CREA { get; set; }
    public DateTime FECHA_CREA { get; set; }
    public string ESTACION_CREA { get; set; }
    public string USUARIO_ACTU { get; set; }
    public DateTime? FECHA_ACTU { get; set; }
    public string ESTACION_ACTU { get; set; }
    public int CORR_EMPRESA { get; set; }
    public string NOMBRE_EMPRESA { get; set; }
    public byte[] FOTO_PERFIL { get; set; }
    public byte[] FOTO_FIRMA { get; set; }
  }
}
