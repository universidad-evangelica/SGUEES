using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;
using eFrameworkAPI.Core;

namespace SGUEES.Repositories
{
    // Qué hace: llama al servicio RPT de SelectionHiring para exportar PDF.
    // Cómo: usa apiRptURL + JWT de GenerateRptToken; endpoint PostScDescriptorPuestoFormatoCortoImpr.
    public class SC_REPORepository : eFrameworkAPI.Data.BaseRepository, ISC_REPORepository
    {
        public SC_REPORepository(IConfiguration config) :
            base(config.GetSection("AppSetting:apiRptURL").Value)
        {
            objData.Token = string.Empty;
        }

        public Task<Stream> GetScDescriptorPuestoFormatoCortoImprAsync(
            List<SC_DESCRIPTOR_PUESTO_IMPRView> data,
            string token)
        {
            objData.Token = token;
            return objData.PostStreamAsync(data, "SelectionHiring", "PostScDescriptorPuestoFormatoCortoImpr");
        }
    }
}
