using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_EMPRESAService: IGEN_EMPRESAService
	{
		private readonly IGEN_EMPRESARepository _repo;
		
		public GEN_EMPRESAService(IGEN_EMPRESARepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(GEN_EMPRESAParam xWhere)
		{
			var p = new List<CParameter>
			{
				//new CParameter() {ParameterName="CORR_PAIS",Value=xWhere.CORR_PAIS,DbType=System.Data.DbType.Int32},
				//new CParameter() {ParameterName="CORR_DEPTO",Value=xWhere.CORR_DEPTO,DbType=System.Data.DbType.Int32},
				//new CParameter() {ParameterName="CORR_MUNICIPIO",Value=xWhere.CORR_MUNICIPIO,DbType=System.Data.DbType.Int32},
				//new CParameter() {ParameterName="CORR_SECTOR_ECONOMICO",Value=xWhere.CORR_SECTOR_ECONOMICO,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_EMPRESAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PAIS",Value=xWhere.CORR_PAIS,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_DEPTO",Value=xWhere.CORR_DEPTO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_MUNICIPIO",Value=xWhere.CORR_MUNICIPIO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_SECTOR_ECONOMICO",Value=xWhere.CORR_SECTOR_ECONOMICO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> CreateWithImagesAsync(GEN_EMPRESAImagesTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var entity = await MapWithImagesAsync(Data);
			return await _repo.CreateAsync(entity, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateWithImagesAsync(GEN_EMPRESAImagesTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var entity = await MapWithImagesAsync(Data);
			return await _repo.UpdateAsync(entity, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_EMPRESATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static async Task<GEN_EMPRESATable> MapWithImagesAsync(GEN_EMPRESAImagesTable Data)
		{
			return new GEN_EMPRESATable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				NOMBRE_EMPRESA = Data.NOMBRE_EMPRESA,
				NOMBRE_COMERCIAL = Data.NOMBRE_COMERCIAL,
				NOMBRE_REPRESENTANTE_LEGAL = Data.NOMBRE_REPRESENTANTE_LEGAL,
				GIRO_EMPRESA = Data.GIRO_EMPRESA,
				DIRECCION_EMPRESA = Data.DIRECCION_EMPRESA,
				NUMERO_NIT = Data.NUMERO_NIT,
				NUMERO_NRC = Data.NUMERO_NRC,
				NOMBRE_CONTACTO = Data.NOMBRE_CONTACTO,
				TELEFONO_1 = Data.TELEFONO_1,
				TELEFONO_2 = Data.TELEFONO_2,
				FAX = Data.FAX,
				CORREO_ELECTRONICO = Data.CORREO_ELECTRONICO,
				LOGO_1 = await ToBytesAsync(Data.Logo1File),
				LOGO_2 = await ToBytesAsync(Data.Logo2File),
				TAMANO_EMPRESA = Data.TAMANO_EMPRESA,
				NATURAL_JURIDICO = Data.NATURAL_JURIDICO,
				CODIGO_EMPRESA = Data.CODIGO_EMPRESA,
				CORR_PAIS = Data.CORR_PAIS,
				CORR_DEPTO = Data.CORR_DEPTO,
				CORR_MUNICIPIO = Data.CORR_MUNICIPIO,
				NOMBRE_EMPRESA_LARGO = Data.NOMBRE_EMPRESA_LARGO,
				DIRECCION_EMPRESA_LARGO = Data.DIRECCION_EMPRESA_LARGO,
				SELLO = await ToBytesAsync(Data.SelloFile),
				CODIGO_POSTAL = Data.CODIGO_POSTAL,
				TIPO_INGRESO_ISR = Data.TIPO_INGRESO_ISR,
				CORR_SECTOR_ECONOMICO = Data.CORR_SECTOR_ECONOMICO,
				USA_CAMPOS_LIBRO_IVA = Data.USA_CAMPOS_LIBRO_IVA,
				PERMITE_EDITAR_CAMPOS_LIBRO_IVA = Data.PERMITE_EDITAR_CAMPOS_LIBRO_IVA,
				USUARIO_CREA = Data.USUARIO_CREA,
				FECHA_CREA = Data.FECHA_CREA,
				ESTACION_CREA = Data.ESTACION_CREA,
				USUARIO_ACTU = Data.USUARIO_ACTU,
				FECHA_ACTU = Data.FECHA_ACTU,
				ESTACION_ACTU = Data.ESTACION_ACTU,
			};
		}

		private static async Task<byte[]> ToBytesAsync(IFormFile file)
		{
			if (file == null || file.Length <= 0)
			{
				return null;
			}

			using var ms = new MemoryStream();
			await file.CopyToAsync(ms);
			return ms.ToArray();
		}
	}
}
