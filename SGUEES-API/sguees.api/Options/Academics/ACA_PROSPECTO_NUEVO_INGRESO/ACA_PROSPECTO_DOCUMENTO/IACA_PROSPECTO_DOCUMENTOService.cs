using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_DOCUMENTOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_DOCUMENTOParam xWhere);

        // Qué hace: guarda o reemplaza el archivo de un documento de la solicitud.
        Task<CResult> CargarArchivoAsync(int corrEmpresa, string usuario, string estacion, int corrProspecto, int corrDocumentoAdmision, IFormFile archivo);

        // Qué hace: abre el archivo ya cargado para verlo en el navegador.
        Task<ACA_PROSPECTO_DOCUMENTOArchivo> AbrirArchivoAsync(int corrEmpresa, int corrProspecto, int corrDocumentoAdmision);

        // Qué hace: quita el archivo cargado y deja el documento otra vez sin archivo.
        Task<CResult> QuitarArchivoAsync(int corrEmpresa, string usuario, string estacion, int corrProspecto, int corrDocumentoAdmision);
    }

    // Qué hace: el archivo que se envía al navegador para previsualizarlo.
    public class ACA_PROSPECTO_DOCUMENTOArchivo
    {
        public System.IO.Stream Stream { get; set; }
        public string ContentType { get; set; }
        public string Nombre { get; set; }
    }
}
