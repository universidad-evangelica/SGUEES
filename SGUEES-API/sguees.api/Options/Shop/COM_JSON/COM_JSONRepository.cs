using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFrameworkAPI.Data;
using eFrameworkAPI.Core;
using scuees.Models;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;
using Org.BouncyCastle.Bcpg;
using System.Reflection.Metadata;

namespace scuees.Repositories
{
	public class COM_JSONRepository : BaseRepository, ICOM_JSONRepository
	{
		public COM_JSONRepository(IConfiguration config) :
				base(config.GetSection("AppSetting:apiFeURL").Value)
		{
			objData.Token = "";
			objData.xFormContent = new MultipartFormDataContent();
		}
		public async Task<CResult<int>> COM_JSON_GENERAR_CCFE(COM_JSON_DTE_CCFE Data, string Token)
		{
			objData.Token = Token;
			return await objData.Post<COM_JSON_DTE_CCFE,int>(Data, "COM_JSON", "COM_JSON_GENERAR_CCFE");
		}
		public async Task<CResult<int>> COM_JSON_GENERAR_FE(COM_JSON_DTE_FE Data, string Token)
		{
			objData.Token = Token;

			return await objData.Post<COM_JSON_DTE_FE,int>(Data, "COM_JSON", "COM_JSON_GENERAR_FE");
		}
		public async Task<CResult<COM_JSON_DOCTable>> PostPDFDesktop(COM_JSON_DOC_PDFTable Data, string Token)
		{
			objData.Token = Token;

			objData.xFormContent.Add(new StringContent(Data.CORR_SUSCRIPCION.ToString()), "CORR_SUSCRIPCION");
			objData.xFormContent.Add(new StringContent(Data.CORR_CONFI_PAIS.ToString()), "CORR_CONFI_PAIS");
			objData.xFormContent.Add(new StringContent(Data.CORR_EMPRESA.ToString()), "CORR_EMPRESA");
			objData.xFormContent.Add(new StringContent(Data.CORR_DOCUMENTO.ToString()), "CORR_DOCUMENTO");
			objData.xFormContent.Add(new StringContent(Data.NOMBRE_DOCUMENTO), "NOMBRE_DOCUMENTO");
			objData.xFormContent.Add(new StringContent(Data.DESCRIPCION_DOCUMENTO), "DESCRIPCION_DOCUMENTO");
			objData.xFormContent.Add(new StringContent(Data.CORR_TIPO_DOCUMENTO.ToString()), "CORR_TIPO_DOCUMENTO");
			objData.xFormContent.Add(new StringContent(Data.NOMBRE_ARCHIVO), "NOMBRE_ARCHIVO");
			objData.xFormContent.Add(new StreamContent(Data.FOTO_DOCUMENTO.OpenReadStream()), "FOTO_DOCUMENTO");
			
			return await objData.PostDataFormDocAsync<COM_JSON_DOCTable>(objData.xFormContent, "COM_JSON", "PostDoc");
		}

		public async Task<CResult<SEG_USUARIO_LOGINView>> Login(SEG_USUARIO_LOGINParam Data)
		{
			return await objData.PostAsync<SEG_USUARIO_LOGINParam,SEG_USUARIO_LOGINView>(Data, "SEG_USUARIO", "login");
		}
		public async Task<Stream> GetDocAsync(COM_JSON_DOCParam Data, string Token)
		{
			objData.Token = Token;

			return await objData.PostStreamAsync(Data, "COM_JSON", "GetDoc");
		}
		public async Task<CResult<int>> COM_JSON_GENERAR_DCLE(COM_JSON_DTE_DCLE Data, string Token)
		{
			objData.Token = Token;

			return await objData.Post<COM_JSON_DTE_DCLE,int>(Data, "COM_JSON", "COM_JSON_GENERAR_DCLE");
		}
	}
}
