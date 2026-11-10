using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PROVEEDOR_USUARIOService : IGEN_PROVEEDOR_USUARIOService
	{
		private const int TipoUsuarioProveedor = 6;
		private readonly IGEN_PROVEEDOR_USUARIORepository _repo;
		private readonly ISEG_USUARIORepository _repoUsuario;

		public GEN_PROVEEDOR_USUARIOService(
			IGEN_PROVEEDOR_USUARIORepository repo,
			ISEG_USUARIORepository repoUsuario)
		{
			_repo = repo;
			_repoUsuario = repoUsuario;
		}

		public Task<CResult> GetAllAsync(GEN_PROVEEDOR_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
			};
			return _repo.GetAllAsync(p);
		}

		public Task<CResult> GetAsync(GEN_PROVEEDOR_USUARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "LOGIN_SISTEMA", Value = xWhere.LOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
			};
			return _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var invalido = ValidarDatos(Data, true);
			if (invalido != null)
			{
				return invalido;
			}

			Normalizar(Data);
			var usuario = ArmarUsuarioSeg(Data, vLOGIN_SISTEMA, vESTACION);
			var creado = await _repoUsuario.CreateAsync(usuario, vLOGIN_SISTEMA, vESTACION);
			if (!creado.Result)
			{
				return creado;
			}

			var vinculo = await _repo.CreateLinkAsync(Data, vLOGIN_SISTEMA, vESTACION);
			if (!vinculo.Result)
			{
				await _repoUsuario.DeleteAsync(usuario, vLOGIN_SISTEMA, vESTACION);
			}

			return vinculo;
		}

		public async Task<CResult> UpdateAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var invalido = ValidarDatos(Data, false);
			if (invalido != null)
			{
				return invalido;
			}

			Normalizar(Data);
			var asignado = await EstaAsignadoAsync(Data);
			if (asignado != null)
			{
				return asignado;
			}

			var actualizado = await _repoUsuario.UpdateAsync(ArmarUsuarioSeg(Data, vLOGIN_SISTEMA, vESTACION), vLOGIN_SISTEMA, vESTACION);
			if (!actualizado.Result)
			{
				return actualizado;
			}

			return await _repo.TouchLinkAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_PROVEEDOR <= 0 || string.IsNullOrWhiteSpace(Data.LOGIN_SISTEMA))
			{
				return Error("Debe indicar el proveedor y el login.");
			}

			Normalizar(Data);
			var asignado = await EstaAsignadoAsync(Data);
			if (asignado != null)
			{
				return asignado;
			}

			var usuario = ArmarUsuarioSeg(Data, vLOGIN_SISTEMA, vESTACION);
			var borrado = await _repoUsuario.DeleteAsync(usuario, vLOGIN_SISTEMA, vESTACION);
			if (!borrado.Result)
			{
				return borrado;
			}

			return await _repo.DeleteLinkAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> CambioClaveAsync(GEN_PROVEEDOR_USUARIO_CLAVEParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_PROVEEDOR <= 0 || string.IsNullOrWhiteSpace(Data.LOGIN_SISTEMA))
			{
				return Error("Debe seleccionar el usuario del proveedor.");
			}

			var nueva = (Data.CLAVE_USUARIO_NUEVA ?? string.Empty).Trim();
			var confirmar = (Data.CLAVE_CONFIRMAR ?? string.Empty).Trim();
			if (nueva.Length < 4)
			{
				return Error("La clave debe tener al menos 4 caracteres.");
			}

			if (!string.Equals(nueva, confirmar, StringComparison.Ordinal))
			{
				return Error("Las claves no coinciden.");
			}

			var probe = new GEN_PROVEEDOR_USUARIOTable
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_PROVEEDOR = Data.CORR_PROVEEDOR,
				LOGIN_SISTEMA = Data.LOGIN_SISTEMA.Trim(),
			};
			var asignado = await EstaAsignadoAsync(probe);
			if (asignado != null)
			{
				return asignado;
			}

			return await _repoUsuario.CambioClave(new SEG_USUARIO_LOGINParam
			{
				LOGIN_SISTEMA = probe.LOGIN_SISTEMA,
				CLAVE_USUARIO = nueva,
				CLAVE_USUARIO_NUEVA = nueva,
			}, vLOGIN_SISTEMA, vESTACION);
		}

		private async Task<CResult> EstaAsignadoAsync(GEN_PROVEEDOR_USUARIOTable Data)
		{
			var actual = await GetAsync(new GEN_PROVEEDOR_USUARIOParam
			{
				CORR_EMPRESA = Data.CORR_EMPRESA,
				CORR_PROVEEDOR = Data.CORR_PROVEEDOR,
				LOGIN_SISTEMA = Data.LOGIN_SISTEMA,
			});
			if (!actual.Result)
			{
				return actual;
			}

			if (actual.Data == null)
			{
				return Error("El usuario no está asignado a este proveedor.");
			}

			return null;
		}

		private static SEG_USUARIOTable ArmarUsuarioSeg(GEN_PROVEEDOR_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var ahora = DateTime.Now;
			return new SEG_USUARIOTable
			{
				LOGIN_SISTEMA = Data.LOGIN_SISTEMA,
				CORR_EMPRESA = Data.CORR_EMPRESA,
				NOMBRE_USUARIO = Data.NOMBRE_USUARIO,
				CORREO_ELECTRONICO = Data.CORREO_ELECTRONICO,
				TIPO_USUARIO = TipoUsuarioProveedor,
				ESTADO_USUARIO = Data.ESTADO_USUARIO,
				IDIOMA = "es-SV",
				USUARIO_CREA = vLOGIN_SISTEMA,
				FECHA_CREA = ahora,
				ESTACION_CREA = vESTACION,
				USUARIO_ACTU = vLOGIN_SISTEMA,
				FECHA_ACTU = ahora,
				ESTACION_ACTU = vESTACION,
			};
		}

		private static void Normalizar(GEN_PROVEEDOR_USUARIOTable Data)
		{
			Data.LOGIN_SISTEMA = (Data.LOGIN_SISTEMA ?? string.Empty).Trim();
			Data.NOMBRE_USUARIO = (Data.NOMBRE_USUARIO ?? string.Empty).Trim();
			Data.CORREO_ELECTRONICO = (Data.CORREO_ELECTRONICO ?? string.Empty).Trim();
		}

		private static CResult ValidarDatos(GEN_PROVEEDOR_USUARIOTable Data, bool esNuevo)
		{
			if (Data == null || Data.CORR_PROVEEDOR <= 0)
			{
				return Error("Guarde el proveedor antes de asignar usuarios.");
			}

			var login = (Data.LOGIN_SISTEMA ?? string.Empty).Trim();
			var nombre = (Data.NOMBRE_USUARIO ?? string.Empty).Trim();
			var correo = (Data.CORREO_ELECTRONICO ?? string.Empty).Trim();
			if (login.Length < 4 || login.Length > 30)
			{
				return Error("El login debe tener entre 4 y 30 caracteres.");
			}

			if (nombre.Length < 4 || nombre.Length > 100)
			{
				return Error("El nombre debe tener entre 4 y 100 caracteres.");
			}

			if (correo.Length < 4 || correo.IndexOf('@') < 1)
			{
				return Error("Debe indicar un correo electrónico válido.");
			}

			if (Data.ESTADO_USUARIO < 0 || Data.ESTADO_USUARIO > 3)
			{
				return Error("Debe seleccionar un estado.");
			}

			if (!esNuevo && string.IsNullOrWhiteSpace(login))
			{
				return Error("Debe especificar el login.");
			}

			return null;
		}

		private static CResult Error(string mensaje)
		{
			return new CResult
			{
				Result = false,
				ErrorCode = -1,
				ErrorMessage = mensaje,
			};
		}
	}
}
