import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegFlujoActor } from './models/seg-flujo-actor';
import { SegFlujoActorService } from './seg-flujo-actor.service';

@Component({
    selector: 'app-seg-flujo-actor',
    templateUrl: './seg-flujo-actor.component.html',
    styleUrls: ['./seg-flujo-actor.component.scss'],
})
export class SegFlujoActorComponent extends CBaseComponent implements OnInit {
    constructor(
        public override appInfoService: AppInfoService,
        public override router: ActivatedRoute,
        private service: SegFlujoActorService
    ) {
        super(appInfoService, router);
        this.columns = this.service.getColumns();
        this.summary = this.service.getSummary();
        this.items = this.service.getItems();
    }

    //#region <Declarando Variales>
    readOnly = false;
    // #endregion

    //#region <Inicializando Opciones>
    ngOnInit(): void {
        this.inicializaOpciones();
        this.consultar();
    }

    inicializaOpciones() {
        const acciones = this.columns.find((c: any) => c.name === 'btnAcciones');
        if (acciones?.buttons) {
            const editBtn = acciones.buttons.find((b: any) => b.icon === 'edit');
            if (editBtn) editBtn.onClick = (e: any) => this.editarClick(e);
        }
    }
    // #endregion

    //#region <Metodos Mtto>
    fillParam(xCORR_ACTOR?: number): any {
        if (xCORR_ACTOR == undefined) {
            xCORR_ACTOR = 0;
        }
        return {
            CORR_ACTOR: xCORR_ACTOR,
        };
    }

    override fillData(xModel?: SegFlujoActor): SegFlujoActor {
        if (xModel !== undefined) {
            return {
                CORR_EMPRESA: xModel.CORR_EMPRESA,
                CORR_ACTOR: xModel.CORR_ACTOR,
                NOMBRE_ACTOR: xModel.NOMBRE_ACTOR,
                DESCRIPCION: xModel.DESCRIPCION,
                REQUIERE_UNIDAD: xModel.REQUIERE_UNIDAD,
                RESOLUCION_AUTOMATICA: xModel.RESOLUCION_AUTOMATICA,
                ACTIVO: xModel.ACTIVO,
                USUARIO_CREA: xModel.USUARIO_CREA,
                ESTACION_CREA: xModel.ESTACION_CREA,
                FECHA_CREA: xModel.FECHA_CREA,
                USUARIO_ACTU: xModel.USUARIO_ACTU,
                ESTACION_ACTU: xModel.ESTACION_ACTU,
                FECHA_ACTU: xModel.FECHA_ACTU,
            };
        } else {
            return {
                CORR_EMPRESA: 1,
                CORR_ACTOR: 0,
                NOMBRE_ACTOR: '',
                DESCRIPCION: '',
                REQUIERE_UNIDAD: false,
                RESOLUCION_AUTOMATICA: false,
                ACTIVO: true,
                USUARIO_CREA: '',
                ESTACION_CREA: '',
                FECHA_CREA: new Date(),
                USUARIO_ACTU: '',
                ESTACION_ACTU: '',
                FECHA_ACTU: new Date(),
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
                            const vIndex = this.models.findIndex(
                                (item: any) => item.CORR_ACTOR === response.Data.CORR_ACTOR
                            );
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
        
        super.cancelar((item: any) => item.CORR_ACTOR === this.modelUpdate.CORR_ACTOR);
    }

    rowRemoving(e: any) {
        this.service
            .delete(this.fillParam(e.data.CORR_ACTOR))
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
        this.dataForm.instance.getEditor('NOMBRE_ACTOR')?.option('readOnly', true);
        this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
        this.dataForm.instance.getEditor('REQUIERE_UNIDAD')?.option('disabled', true);
        this.dataForm.instance.getEditor('ACTIVO')?.option('disabled', true);
        this.readOnly = true;
    }

    override habilitar(): void {
        this.readOnly = false;
    }

    override setFocus() {
        setTimeout(() => {
            this.dataForm.instance.getEditor('NOMBRE_ACTOR')?.focus();
        });
    }
    //#endregion
}