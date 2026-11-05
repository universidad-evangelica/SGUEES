using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
namespace SGUEES.Services {
 public partial class ACA_BEC_TIPOService {
  public Task<CResult> CuestionariosAsync(int empresa)=>empresa>0?_repo.CuestionariosAsync(empresa):Task.FromResult(ValidationError("La empresa de sesion no es valida."));
  public Task<CResult> PlantillasFormularioAsync(int empresa)=>empresa>0?_repo.PlantillasFormularioAsync(empresa):Task.FromResult(ValidationError("La empresa de sesion no es valida."));
  public Task<CResult> FormulariosAsync(int empresa)=>empresa>0?_repo.FormulariosAsync(empresa):Task.FromResult(ValidationError("La empresa de sesion no es valida."));
  public Task<CResult> VersionesAsync(int empresa)=>empresa>0?_repo.VersionesAsync(empresa):Task.FromResult(ValidationError("La empresa de sesion no es valida."));
  public Task<CResult> AsignacionesAsync(int empresa,int beca)=>empresa>0&&beca>0?_repo.AsignacionesAsync(empresa,beca):Task.FromResult(ValidationError("Seleccione una beca de su empresa."));
  public Task<CResult> CiclosFormularioAsync(int empresa)=>empresa>0?_repo.CiclosFormularioAsync(empresa):Task.FromResult(ValidationError("La empresa de sesion no es valida."));
  public Task<CResult> GuardarFormularioAsync(string operacion,BecaFormularioCambio data,string usuario,string estacion) {
   if(data==null||data.CORR_EMPRESA<=0||data.CORR_BECA<=0)return Task.FromResult(ValidationError("Seleccione una beca de su empresa."));
   if(data.CODIGO_FORMULARIO?.Length>30||data.NOMBRE_FORMULARIO?.Length>200||data.DESCRIPCION?.Length>1000||data.VERSION_FORMULARIO?.Length>20)
    return Task.FromResult(ValidationError("Los datos exceden la longitud permitida para el formulario o version."));
   if(data.FECHA_INICIO.HasValue&&data.FECHA_FIN.HasValue&&data.FECHA_FIN.Value.Date<data.FECHA_INICIO.Value.Date)
    return Task.FromResult(ValidationError("La fecha fin no puede ser anterior al inicio."));
   if(operacion!="CREAR_DESDE_CERO"&&operacion!="CREAR_FORMULARIO"&&operacion!="CREAR_VERSION"&&operacion!="ASIGNAR"&&(data.ID<=0||data.VERSION_REGISTRO?.Length!=8))
    return Task.FromResult(ValidationError("Actualice el listado para obtener la version del registro."));
   data.CODIGO_FORMULARIO=data.CODIGO_FORMULARIO?.Trim().ToUpperInvariant();data.NOMBRE_FORMULARIO=data.NOMBRE_FORMULARIO?.Trim();data.VERSION_FORMULARIO=data.VERSION_FORMULARIO?.Trim();
   return _repo.GuardarFormularioAsync(operacion,data,usuario,estacion);
  }
 }
}
