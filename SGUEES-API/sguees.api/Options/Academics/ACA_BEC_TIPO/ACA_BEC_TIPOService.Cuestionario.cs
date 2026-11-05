using System;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
namespace SGUEES.Services {
 public partial class ACA_BEC_TIPOService {
  public Task<CResult> ContenidoCuestionarioAsync(int empresa,int beca,int version)=>empresa>0&&beca>0&&version>0?_repo.ContenidoCuestionarioAsync(empresa,beca,version):Task.FromResult(ValidationError("Seleccione una beca y una version validas."));
  public Task<CResult> GuardarCuestionarioAsync(string operacion,BecaCuestionarioCambio data,string usuario,string estacion) {
   if(data==null||data.CORR_EMPRESA<=0||data.CORR_BECA<=0||data.CORR_FORMULARIO_VERSION<=0||!Enum.IsDefined(typeof(BecaElemento),data.ELEMENTO)||data.VERSION_REGISTRO?.Length!=8)
    return Task.FromResult(ValidationError("Actualice el cuestionario y seleccione un elemento valido."));
   if(data.NOMBRE_SECCION?.Length>200||data.DESCRIPCION?.Length>1000||data.AYUDA?.Length>1000||data.CODIGO_PREGUNTA?.Length>50||data.TEXTO_OPCION?.Length>500||data.TEXTO_PREGUNTA?.Length>20000)
    return Task.FromResult(ValidationError("El contenido excede la longitud permitida."));
   if(operacion=="AGREGAR")data.ID=0;
   else if(data.ID<=0)return Task.FromResult(ValidationError("Seleccione el elemento que desea modificar."));
   if(data.FECHA_FIN<data.FECHA_INICIO)return Task.FromResult(ValidationError("La fecha fin no puede ser anterior al inicio."));
   return _repo.GuardarCuestionarioAsync(operacion,data,usuario,estacion);
  }
 }
}
