import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { IParam } from 'src/app/FxAPI/IParam';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenEmpresa } from './models/gen-empresa';
import { GenEmpresaService } from './gen-empresa.service';

@Component({
	selector: 'app-gen-empresa',
	templateUrl: './gen-empresa.component.html',
})
export class GenEmpresaComponent extends CBaseComponent implements OnInit {
	protected override etiquetaRegistro = 'la empresa';
	protected override requiereEmpresaSesion = false;
	protected override mttoGridKeyExpr = 'CORR_EMPRESA';
	protected override mttoRemoteOperations = false;
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

	ngOnInit(): void {		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {		}
	}

	llenaComboBox() {
		this.getCORR_PAIS();
		this.getCORR_SECTOR_ECONOMICO();
	}

	getCORR_PAIS() {
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_ESTRUCTURA_TERRITORIAL', 'GetCORR_PAIS', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PAIS = response.Data;
					} else {
						this.notifyApiResponse(response);
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_DEPTO(corrPais?: number) {
		const pais = corrPais ?? this.model?.CORR_PAIS;
		if (!pais) {
			this.mCORR_DEPTO = [];
			return;
		}
		const xWhere: IParam[] = [{ Parameter: 'CORR_PAIS', Value: pais }];
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_ESTRUCTURA_TERRITORIAL', 'GetCORR_DEPTO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_DEPTO = response.Data;
					} else {
						this.notifyApiResponse(response);
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_MUNICIPIO(corrPais?: number, corrDepto?: number) {
		const pais = corrPais ?? this.model?.CORR_PAIS;
		const depto = corrDepto ?? this.model?.CORR_DEPTO;
		if (!pais || !depto) {
			this.mCORR_MUNICIPIO = [];
			return;
		}
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PAIS', Value: pais },
			{ Parameter: 'CORR_DEPTO', Value: depto },
		];
		this.appInfoService
			.getLookUp('GEN_EMPRESA', 'GEN_ESTRUCTURA_TERRITORIAL', 'GetCORR_MUNICIPIO', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_MUNICIPIO = response.Data;
					} else {
						this.notifyApiResponse(response);
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	getCORR_SECTOR_ECONOMICO() {
		this.appInfoService
			.getLookUp(
				'GEN_EMPRESA',
				'GEN_SECTOR_ECONOMICO',
				'GetCORR_SECTOR_ECONOMICO',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_SECTOR_ECONOMICO = response.Data;
					} else {
						this.notifyApiResponse(response);
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	onPaisChange(value: number): void {
		this.model.CORR_DEPTO = 0;
		this.model.CORR_MUNICIPIO = 0;
		this.mCORR_MUNICIPIO = [];
		this.getCORR_DEPTO(value);
	}

	onDeptoChange(value: number): void {
		this.model.CORR_MUNICIPIO = 0;
		this.getCORR_MUNICIPIO(this.model.CORR_PAIS, value);
	}

	fillParam(xCORR_EMPRESA?: number): any {
		return {
			CORR_EMPRESA: xCORR_EMPRESA ?? 0,
		};
	}

	override fillData(xModel?: GenEmpresa): GenEmpresa {
		if (xModel !== undefined) {
			return { ...xModel };
		}

		return {
			CORR_EMPRESA: 0,
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

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
		});
	}

	override editarClick(e: any): void {
		super.editarClick(e);
		this.clearImageState();
		if (this.model?.CORR_PAIS) {
			this.getCORR_DEPTO(this.model.CORR_PAIS);
		}
		if (this.model?.CORR_PAIS && this.model?.CORR_DEPTO) {
			this.getCORR_MUNICIPIO(this.model.CORR_PAIS, this.model.CORR_DEPTO);
		}
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insertWithImages(this.buildEmpresaFormData()),
			update: () => this.service.updateWithImages(this.buildEmpresaFormData(), this.model.CORR_EMPRESA),
			onSuccess: () => this.clearImageState(),
			successAddMessage: 'Empresa creada con éxito.',
			successUpdateMessage: 'Empresa modificada con éxito.',
		});
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
			this.notifyFx('El archivo seleccionado no es una imagen.', NotifyType.Warning);
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

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_EMPRESA)),
		});
	}

	override bloquear(): void {
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
