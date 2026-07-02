import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { MessageService } from 'primeng/api'; //Import para usar PrimeNG Toast
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import { ScRequisicionPersonal } from './models/sc-requisicion-personal';

import { ScRequisicionPersonalService } from './sc-requisicion-personal.service';
import { ScTipoModalidadService } from '../sc-tipo-modalidad/sc-tipo-modalidad.service'; //Importo para poder utilizar tipo modalidades
import { PlaDepartamentoService } from '../../Payroll/pla-departamento/pla-departamento.service'; //Importo para poder utilizar departamentos
import { ScTipoContratacionService } from '../sc-tipo-contratacion/sc-tipo-contratacion.service';
import { ScTipoVacanteService } from '../sc-tipo-vacante/sc-tipo-vacante.service';

@Component({
  selector: 'app-sc-requisicion-personal',
  templateUrl: './sc-requisicion-personal.component.html',
  styleUrls: ['./sc-requisicion-personal.component.scss']
})
export class ScRequisicionPersonalComponent extends CBaseComponent implements OnInit {
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScRequisicionPersonalService,
		private messageService: MessageService, //Import para usar PrimeNG Toast
		private departamentoService: PlaDepartamentoService, //importo para utilizarlo en combo box
		private tipoModalidadService: ScTipoModalidadService, //importo para utilizarlo en combo box
		private tipoContratacionService: ScTipoContratacionService, //importo para utilizarlo en combo box
		private tipoVacanteService: ScTipoVacanteService //importo para utilizarlo en combo box

	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();

		//inserto las columnas de la tabla bitacora de requisicion
		this.headersRequisicionBitacora = this.service.headersRequisicionBitacora();
	}

	//Variables
	listadoDescriptores: any[] = [];
	listadoDepartamento: any[] = [];
	listadoTipoModalidad: any[] = [];
	listadoTipoContratacion: any[] = [];
	listadoTipoVacante: any[] = [];
	headersRequisicionBitacora: any[] = [];
	// Datos quemados para el tab "Tabla" (reemplazar por API cuando esté disponible).
	itemsBitacoraRequisicion = [
		{ CORR_DETALLE: 1, DESCRIPCION: 'Analista de sistemas', CANTIDAD: 2, ESTADO: 'Pendiente' },
		{ CORR_DETALLE: 2, DESCRIPCION: 'Técnico de soporte', CANTIDAD: 1, ESTADO: 'Aprobado' },
		{ CORR_DETALLE: 3, DESCRIPCION: 'Coordinador de proyecto', CANTIDAD: 1, ESTADO: 'Pendiente' },
		{ CORR_DETALLE: 4, DESCRIPCION: 'Diseñador gráfico', CANTIDAD: 1, ESTADO: 'Rechazado' },
		{ CORR_DETALLE: 5, DESCRIPCION: 'Especialista en marketing digital', CANTIDAD: 2, ESTADO: 'Aprobado' },
		{ CORR_DETALLE: 6, DESCRIPCION: 'Ingeniero de calidad', CANTIDAD: 1, ESTADO: 'Pendiente' },
		{ CORR_DETALLE: 7, DESCRIPCION: 'Administrador de base de datos esta es una prueba larga para ver el tamaño de la tabla donde quedara la bitacora de la requisicion', CANTIDAD: 1, ESTADO: 'Aprobado' },
	];

	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
		// 2. Este método ahora lee dinámicamente las reglas y asigna los eventos
		Object.keys(this.reglasVisibilidad).forEach(triggerField => {
        this.setEditorOption(
            triggerField,
            'onValueChanged',
            (e: any) => this.evaluarReglas(triggerField, e.value)
        );
    });

	}

	llenaComboBox() {
		this.getAllDepartamento();
		this.getAllTipoModalidad();
		this.getAllTipoContratacion();
		this.getAllTipoVacante();
	}

	// Asigna un dataSource a la configuracion editorOptions de un item del dx-form por su dataField.
	actualizarComboBoxGeneral(dataField: string, dataSource: any[]): void {
		const item = this.buscarFormItem(dataField);
		if (item) {
			item.editorOptions = { ...item.editorOptions, dataSource };
		}
	}

	// Busca un item por dataField dentro de this.items (soporta tabs e items anidados).
	private buscarFormItem(dataField: string, items: any[] = this.items): any | undefined {
		for (const item of items ?? []) {
			if (item?.dataField === dataField) {
				return item;
			}
			if (item?.tabs?.length) {
				for (const tab of item.tabs) {
					const encontrado = this.buscarFormItem(dataField, tab.items);
					if (encontrado) {
						return encontrado;
					}
				}
			}
			if (item?.items?.length) {
				const encontrado = this.buscarFormItem(dataField, item.items);
				if (encontrado) {
					return encontrado;
				}
			}
		}
		return undefined;
	}

	// =========================================
	// Tus utilitarios originales (se mantienen)

	// 1. Centralizamos todas las dependencias en un solo lugar.
	// Aquí irás agregando tus nuevos campos sin crear nuevas funciones.
	readonly reglasVisibilidad: { [key: string]: Array<{ targetField: string, isVisible: (value: any) => boolean }> } = {
		'CORR_TIPO_CONTRATACION': [
			{ targetField: 'TIEMPO_CONTRATO', isVisible: (value) => value === 2 }
		],
		// Ejemplo de cómo agregarías otro campo en el futuro:
		// 'ESTADO_CIVIL': [
		//     { targetField: 'NOMBRE_CONYUGE', isVisible: (value) => value === 'CASADO' },
		//     { targetField: 'FECHA_MATRIMONIO', isVisible: (value) => value === 'CASADO' }
		// ]
	};

	// 3. Un único método para evaluar cualquier regla
	private evaluarReglas(triggerField: string, newValue: any): void {
		const reglas = this.reglasVisibilidad[triggerField];
		if (!reglas) return;

		reglas.forEach(regla => {
        this.setVisibleItem(regla.targetField, regla.isVisible(newValue));
    });
	}

	private setEditorOption(dataField: string, option: string, value: any): void {
		const item = this.buscarFormItem(dataField);
		if (item) {
			item.editorOptions = { ...item.editorOptions, [option]: value };
		}
	}

	private setVisibleItem(dataField: string, visible: boolean): void {
		const item = this.buscarFormItem(dataField);
		
		// Solo reasignamos this.items si la visibilidad realmente cambió.
		if (item && item.visible !== visible) {
			item.visible = visible;
			this.items = [...this.items];
		}
	}
	// =========================================
	

	//listado de catalogos
	getAllDepartamento(){
		this.departamentoService.getAll({CORR_DEPARTAMENTO: 0})
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.listadoDepartamento = response.Data;
					// Inyecta el catalogo cargado al dataSource del dxSelectBox 'CORR_DEPARTAMENTO'.
					this.actualizarComboBoxGeneral('CORR_DEPARTAMENTO', this.listadoDepartamento);
				}
			},
			error: (error: any) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}

	getAllTipoModalidad(){
		this.tipoModalidadService.getAll({CORR_TIPO_MODALIDAD: 0})
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.listadoTipoModalidad = response.Data;
					// Inyecta el catalogo cargado al dataSource del dxSelectBox 'CORR_TIPO_MODALIDAD'.
					this.actualizarComboBoxGeneral('CORR_TIPO_MODALIDAD', this.listadoTipoModalidad);
				}
			},
			error: (error: any) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}

	getAllTipoContratacion(){
		this.tipoContratacionService.getAll({CORR_TIPO_CONTRATACION: 0})
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.listadoTipoContratacion = response.Data;
					// Inyecta el catalogo cargado al dataSource del dxSelectBox 'CORR_TIPO_CONTRATACION'.
					this.actualizarComboBoxGeneral('CORR_TIPO_CONTRATACION', this.listadoTipoContratacion);
				}
			},
			error: (error: any) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}

	getAllTipoVacante(){
		this.tipoVacanteService.getAll({CORR_TIPO_VACANTE: 0})
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.listadoTipoVacante = response.Data;
					// Inyecta el catalogo cargado al dataSource del dxSelectBox 'CORR_TIPO_VACANTE'.
					this.actualizarComboBoxGeneral('CORR_TIPO_VACANTE', this.listadoTipoVacante);
				}
			},
			error: (error: any) => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
			},
		});
	}



	fillParam(xCORR_REQUISICION?: number): any {
		if (xCORR_REQUISICION == undefined) {
			xCORR_REQUISICION = 0;
		}
		return {
			CORR_REQUISICION_PERSONAL: xCORR_REQUISICION,
		};
	}

	override fillData(xModel?: ScRequisicionPersonal): ScRequisicionPersonal {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_REQUISICION_PERSONAL: xModel.CORR_REQUISICION_PERSONAL,
				CORR_DESCRIPTOR: xModel.CORR_DESCRIPTOR,
				CORR_DEPARTAMENTO: xModel.CORR_DEPARTAMENTO,
				CORR_PUESTO: xModel.CORR_PUESTO,
				CORR_TIPO_MODALIDAD: xModel.CORR_TIPO_MODALIDAD,
				CORR_TIPO_CONTRATACION: xModel.CORR_TIPO_CONTRATACION,
				CORR_TIPO_VACANTE: xModel.CORR_TIPO_VACANTE,
				CANTIDAD_PLAZAS: xModel.CANTIDAD_PLAZAS,
				PLAZAS_CUBIERTAS: xModel.PLAZAS_CUBIERTAS,
				FECHA_REQUISICION: xModel.FECHA_REQUISICION,
				JUSTIFICACION: xModel.JUSTIFICACION,
				CORR_EMPLEADO_SUSTITUTO: xModel.CORR_EMPLEADO_SUSTITUTO,
				SALARIO_MINIMO: xModel.SALARIO_MINIMO,
				SALARIO_MAXIMO: xModel.SALARIO_MAXIMO,
				CORR_ESTADO_REQUISICION: xModel.CORR_ESTADO_REQUISICION,
				FECHA_APROBACION: xModel.FECHA_APROBACION,
				FECHA_CIERRE: xModel.FECHA_CIERRE,
				TIEMPO_CONTRATO: xModel.TIEMPO_CONTRATO,
				HORARIO: xModel.HORARIO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_REQUISICION_PERSONAL: 0,
			CORR_DESCRIPTOR: 0,
			CORR_DEPARTAMENTO: 0,
			CORR_PUESTO: 0,
			CORR_TIPO_MODALIDAD: 0,
			CORR_TIPO_CONTRATACION: 0,
			CORR_TIPO_VACANTE: 0,
			CANTIDAD_PLAZAS: 0,
			PLAZAS_CUBIERTAS: 0,
			FECHA_REQUISICION: new Date(),
			JUSTIFICACION: '',
			CORR_EMPLEADO_SUSTITUTO: '',
			SALARIO_MINIMO: 0,
			SALARIO_MAXIMO: 0,
			CORR_ESTADO_REQUISICION: 0,
			FECHA_APROBACION: null,
			FECHA_CIERRE: null,
			TIEMPO_CONTRATO: 0,
			HORARIO: '',
			USUARIO_CREA: '',
			FECHA_CREA: new Date(),
			ESTACION_CREA: '',
			USUARIO_ACTU: '',
			FECHA_ACTU: new Date(),
			ESTACION_ACTU: '',
		};
	}

	consultar() {
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data ?? [];
						console.log('Datos consultados:', this.models);
					} else {
						this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
					}
				},
				error: (error: any) => {
					this.messageService.add({ severity: 'error', summary: 'Error', detail: error?.message ?? error });
				},
			});
	}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
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
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.CORR_REQUISICION_PERSONAL === response.Data.CORR_REQUISICION_PERSONAL);
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

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_REQUISICION_PERSONAL === this.modelUpdate.CORR_REQUISICION_PERSONAL);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_REQUISICION_PERSONAL))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = this.models.filter(
							(item: any) => item.CORR_REQUISICION_PERSONAL !== e.data.CORR_REQUISICION_PERSONAL
						);
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
					} else {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error?.message ?? error, NotifyType.Error);
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_REQUISICION_PERSONAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_REQUISICION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DESCRIPTOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_MODALIDAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_CONTRATACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_VACANTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIEMPO_CONTRATO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('HORARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_CIERRE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_APROBACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CANTIDAD_PLAZAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PLAZAS_CUBIERTAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SALARIO_MINIMO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SALARIO_MAXIMO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_ESTADO_REQUISICION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('JUSTIFICACION')?.option('readOnly', true);
	}

	// override setFocus() {
	// 	setTimeout(() => {
	// 		this.dataForm.instance.getEditor('USUARIO_SOLICITA')?.focus();
	// 	});
	// }

}
