import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenEmpresa } from './models/gen-empresa';
import { GenEmpresaService } from './gen-empresa.service';
import { IParam } from 'src/app/FxAPI/IParam';
@Component({
	selector: 'app-gen-empresa',
	templateUrl: './gen-empresa.component.html',
	styleUrls: ['./gen-empresa.component.scss'],
})
export class GenEmpresaComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenEmpresaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	//#region <Declarando Variales>
	mCORR_PAIS: any;
	mCORR_DEPTO: any;
	mCORR_MUNICIPIO: any;
	mCORR_SECTOR_ECONOMICO: any;
	readOnly = false;
	logo1File: File | null = null;
	logo2File: File | null = null;
	selloFile: File | null = null;
	logo1Preview: string | null = null;
	logo2Preview: string | null = null;
	selloPreview: string | null = null;
	// #endregion

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_PAIS();
		this.getCORR_DEPTO();
		this.getCORR_MUNICIPIO();
		this.getCORR_SECTOR_ECONOMICO();
	}

	getCORR_PAIS() {
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_PAIS', 'GetCORR_PAIS', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PAIS = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_DEPTO() {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: 1 }];
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_DEPTO', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_DEPTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_MUNICIPIO() {
		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPTO', Value: 1 }];
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_MUNICIPIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_SECTOR_ECONOMICO() {
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_SECTOR_ECONOMICO', 'GetCORR_SECTOR_ECONOMICO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_SECTOR_ECONOMICO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	onPaisChange(value: number): void {
		console.log('Pais seleccionado:', value);

		let xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: value }];
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_DEPTO', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_DEPTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	onDeptoChange(value: number): void {
		console.log('Depto seleccionado:', value);

		let xWhere: IParam[] = [{ Parameter: 'CORR_DEPTO', Value: value }];
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_MUNICIPIO', 'GetCORR_MUNICIPIO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_MUNICIPIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_EMPRESA?: number): any {
		if (xCORR_EMPRESA == undefined) {
			xCORR_EMPRESA = 0;
		}
		return {
			CORR_EMPRESA: xCORR_EMPRESA,
		};
	}

	override fillData(xModel?: GenEmpresa): GenEmpresa {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				NOMBRE_EMPRESA: xModel.NOMBRE_EMPRESA,
				NOMBRE_COMERCIAL: xModel.NOMBRE_COMERCIAL,
				NOMBRE_REPRESENTANTE_LEGAL: xModel.NOMBRE_REPRESENTANTE_LEGAL,
				GIRO_EMPRESA: xModel.GIRO_EMPRESA,
				DIRECCION_EMPRESA: xModel.DIRECCION_EMPRESA,
				NUMERO_NIT: xModel.NUMERO_NIT,
				NUMERO_NRC: xModel.NUMERO_NRC,
				NOMBRE_CONTACTO: xModel.NOMBRE_CONTACTO,
				TELEFONO_1: xModel.TELEFONO_1,
				TELEFONO_2: xModel.TELEFONO_2,
				FAX: xModel.FAX,
				CORREO_ELECTRONICO: xModel.CORREO_ELECTRONICO,
				LOGO_1: xModel.LOGO_1,
				LOGO_2: xModel.LOGO_2,
				TAMANO_EMPRESA: xModel.TAMANO_EMPRESA,
				NATURAL_JURIDICO: xModel.NATURAL_JURIDICO,
				CODIGO_EMPRESA: xModel.CODIGO_EMPRESA,
				CORR_PAIS: xModel.CORR_PAIS,
				CORR_DEPTO: xModel.CORR_DEPTO,
				CORR_MUNICIPIO: xModel.CORR_MUNICIPIO,
				NOMBRE_EMPRESA_LARGO: xModel.NOMBRE_EMPRESA_LARGO,
				DIRECCION_EMPRESA_LARGO: xModel.DIRECCION_EMPRESA_LARGO,
				SELLO: xModel.SELLO,
				CODIGO_POSTAL: xModel.CODIGO_POSTAL,
				TIPO_INGRESO_ISR: xModel.TIPO_INGRESO_ISR,
				CORR_SECTOR_ECONOMICO: xModel.CORR_SECTOR_ECONOMICO,
				USA_CAMPOS_LIBRO_IVA: xModel.USA_CAMPOS_LIBRO_IVA,
				PERMITE_EDITAR_CAMPOS_LIBRO_IVA: xModel.PERMITE_EDITAR_CAMPOS_LIBRO_IVA,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				NOMBRE_PAIS: xModel.NOMBRE_PAIS,
				NOMBRE_DEPTO: xModel.NOMBRE_DEPTO,
				NOMBRE_MUNICIPIO: xModel.NOMBRE_MUNICIPIO,
				NOMBRE_SECTOR_ECONOMICO: xModel.NOMBRE_SECTOR_ECONOMICO,
			};
		} else {
			return {
			CORR_EMPRESA: 1,
				NOMBRE_EMPRESA: '',
				NOMBRE_COMERCIAL: '',
				NOMBRE_REPRESENTANTE_LEGAL: '',
				GIRO_EMPRESA: '',
				DIRECCION_EMPRESA: '',
				NUMERO_NIT: '',
				NUMERO_NRC: '',
				NOMBRE_CONTACTO: '',
				TELEFONO_1: '',
				TELEFONO_2: '',
				FAX: '',
				CORREO_ELECTRONICO: '',
				LOGO_1: null,
				LOGO_2: null,
				TAMANO_EMPRESA: '',
				NATURAL_JURIDICO: '',
				CODIGO_EMPRESA: '',
				CORR_PAIS: 0,
				CORR_DEPTO: 0,
				CORR_MUNICIPIO: 0,
				NOMBRE_EMPRESA_LARGO: '',
				DIRECCION_EMPRESA_LARGO: '',
				SELLO: null,
				CODIGO_POSTAL: '',
				TIPO_INGRESO_ISR: 0,
				CORR_SECTOR_ECONOMICO: 0,
				USA_CAMPOS_LIBRO_IVA: true,
				PERMITE_EDITAR_CAMPOS_LIBRO_IVA: true,
				USUARIO_CREA: '',
				FECHA_CREA: new Date(),
				ESTACION_CREA: '',
				USUARIO_ACTU: '',
				FECHA_ACTU: new Date(),
				ESTACION_ACTU: '',
				NOMBRE_PAIS: '',
				NOMBRE_DEPTO: '',
				NOMBRE_MUNICIPIO: '',
				NOMBRE_SECTOR_ECONOMICO: '',
			};
		}
	}

	consultar() {
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		const formData = this.buildEmpresaFormData();
		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insertWithImages(formData)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.models.push(response.Data);
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		} else if (this.banderaMtto === UpdateType.Update) {
			this.service
				.updateWithImages(formData, this.model.CORR_EMPRESA)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.CORR_EMPRESA === response.Data.CORR_EMPRESA);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		}
	}

	private buildEmpresaFormData(): FormData {
		const formData = new FormData();

		const appendValue = (key: string, value: any) => {
			if (value === null || value === undefined) {
				formData.append(key, '');
				return;
			}

			if (value instanceof Date) {
				formData.append(key, value.toISOString());
				return;
			}

			formData.append(key, String(value));
		};

		appendValue('CORR_EMPRESA', this.model.CORR_EMPRESA);
		appendValue('NOMBRE_EMPRESA', this.model.NOMBRE_EMPRESA);
		appendValue('NOMBRE_COMERCIAL', this.model.NOMBRE_COMERCIAL);
		appendValue('NOMBRE_REPRESENTANTE_LEGAL', this.model.NOMBRE_REPRESENTANTE_LEGAL);
		appendValue('GIRO_EMPRESA', this.model.GIRO_EMPRESA);
		appendValue('DIRECCION_EMPRESA', this.model.DIRECCION_EMPRESA);
		appendValue('NUMERO_NIT', this.model.NUMERO_NIT);
		appendValue('NUMERO_NRC', this.model.NUMERO_NRC);
		appendValue('NOMBRE_CONTACTO', this.model.NOMBRE_CONTACTO);
		appendValue('TELEFONO_1', this.model.TELEFONO_1);
		appendValue('TELEFONO_2', this.model.TELEFONO_2);
		appendValue('FAX', this.model.FAX);
		appendValue('CORREO_ELECTRONICO', this.model.CORREO_ELECTRONICO);
		appendValue('TAMANO_EMPRESA', this.model.TAMANO_EMPRESA);
		appendValue('NATURAL_JURIDICO', this.model.NATURAL_JURIDICO);
		appendValue('CODIGO_EMPRESA', this.model.CODIGO_EMPRESA);
		appendValue('CORR_PAIS', this.model.CORR_PAIS);
		appendValue('CORR_DEPTO', this.model.CORR_DEPTO);
		appendValue('CORR_MUNICIPIO', this.model.CORR_MUNICIPIO);
		appendValue('NOMBRE_EMPRESA_LARGO', this.model.NOMBRE_EMPRESA_LARGO);
		appendValue('DIRECCION_EMPRESA_LARGO', this.model.DIRECCION_EMPRESA_LARGO);
		appendValue('CODIGO_POSTAL', this.model.CODIGO_POSTAL);
		appendValue('TIPO_INGRESO_ISR', this.model.TIPO_INGRESO_ISR);
		appendValue('CORR_SECTOR_ECONOMICO', this.model.CORR_SECTOR_ECONOMICO);
		appendValue('USA_CAMPOS_LIBRO_IVA', this.model.USA_CAMPOS_LIBRO_IVA);
		appendValue('PERMITE_EDITAR_CAMPOS_LIBRO_IVA', this.model.PERMITE_EDITAR_CAMPOS_LIBRO_IVA);
		appendValue('USUARIO_CREA', this.model.USUARIO_CREA);
		appendValue('USUARIO_ACTU', this.model.USUARIO_ACTU);
		appendValue('NOMBRE_PAIS', this.model.NOMBRE_PAIS);
		appendValue('NOMBRE_DEPTO', this.model.NOMBRE_DEPTO);
		appendValue('NOMBRE_MUNICIPIO', this.model.NOMBRE_MUNICIPIO);
		appendValue('NOMBRE_SECTOR_ECONOMICO', this.model.NOMBRE_SECTOR_ECONOMICO);

		if (this.logo1File) {
			formData.append('Logo1File', this.logo1File, this.logo1File.name);
			formData.append('LOGO_1', this.logo1File, this.logo1File.name);
		}

		if (this.logo2File) {
			formData.append('Logo2File', this.logo2File, this.logo2File.name);
			formData.append('LOGO_2', this.logo2File, this.logo2File.name);
		}

		if (this.selloFile) {
			formData.append('SelloFile', this.selloFile, this.selloFile.name);
			formData.append('SELLO', this.selloFile, this.selloFile.name);
		}

		return formData;
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_EMPRESA === this.modelUpdate.CORR_EMPRESA);
		this.clearImageState();
	}

	onLogo1Selected(e: any): void {
		this.handleSelectedFile(e, 'logo1');
	}

	onLogo2Selected(e: any): void {
		this.handleSelectedFile(e, 'logo2');
	}

	onSelloSelected(e: any): void {
		this.handleSelectedFile(e, 'sello');
	}

	private handleSelectedFile(e: any, tipo: 'logo1' | 'logo2' | 'sello'): void {
		const file = e?.value?.[0] ?? null;

		if (tipo === 'logo1') this.logo1File = file;
		if (tipo === 'logo2') this.logo2File = file;
		if (tipo === 'sello') this.selloFile = file;

		if (!file) {
			if (tipo === 'logo1') this.logo1Preview = null;
			if (tipo === 'logo2') this.logo2Preview = null;
			if (tipo === 'sello') this.selloPreview = null;
			return;
		}

		if (!file.type.startsWith('image/')) {
			this.notifyFx('El archivo seleccionado no es una imagen.', NotifyType.Error);
			if (tipo === 'logo1') {
				this.logo1File = null;
				this.logo1Preview = null;
			}
			if (tipo === 'logo2') {
				this.logo2File = null;
				this.logo2Preview = null;
			}
			if (tipo === 'sello') {
				this.selloFile = null;
				this.selloPreview = null;
			}
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const preview = (reader.result as string) || null;
			if (tipo === 'logo1') this.logo1Preview = preview;
			if (tipo === 'logo2') this.logo2Preview = preview;
			if (tipo === 'sello') this.selloPreview = preview;
		};
		reader.readAsDataURL(file);
	}

	private clearImageState(): void {
		this.logo1File = null;
		this.logo2File = null;
		this.selloFile = null;
		this.logo1Preview = null;
		this.logo2Preview = null;
		this.selloPreview = null;
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_EMPRESA))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						e.component.refresh();
					} else {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('NOMBRE_EMPRESA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_COMERCIAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_REPRESENTANTE_LEGAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('GIRO_EMPRESA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DIRECCION_EMPRESA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_NIT')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_NRC')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CONTACTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TELEFONO_1')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TELEFONO_2')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FAX')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORREO_ELECTRONICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('LOGO_1')?.option('readOnly', true);
		this.dataForm.instance.getEditor('LOGO_2')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TAMANO_EMPRESA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NATURAL_JURIDICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_EMPRESA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PAIS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DEPTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_MUNICIPIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_EMPRESA_LARGO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DIRECCION_EMPRESA_LARGO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SELLO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_POSTAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIPO_INGRESO_ISR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_SECTOR_ECONOMICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USA_CAMPOS_LIBRO_IVA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PERMITE_EDITAR_CAMPOS_LIBRO_IVA')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_EMPRESA')?.focus();
		});
	}
	//#endregion

	selectedLookUpPais(vRow: any): any {
		return vRow[0].CORR_PAIS;
	}
	selectedLookUpDepto(vRow: any): any {
		return vRow[0].CORR_DEPTO;
	}
	selectedLookUpMunicipio(vRow: any): any {
		return vRow[0].CORR_MUNICIPIO;
	}
	selectedLookUpSectorEconomico(vRow: any): any {
		return vRow[0].CORR_SECTOR_ECONOMICO;
	}
}
