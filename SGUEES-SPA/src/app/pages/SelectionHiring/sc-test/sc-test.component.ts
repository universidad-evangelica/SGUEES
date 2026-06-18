import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScTest } from './models/sc-test';
import { ScTestService } from './sc-test.service';

@Component({
  selector: 'app-sc-test',
  templateUrl: './sc-test.component.html',
  styleUrls: ['./sc-test.component.scss'],
})
export class ScTestComponent extends CBaseComponent implements OnInit {
  @ViewChild('dataGrid', { static: false }) dataGrid?: DxDataGridComponent;

  formPopupVisible = false;
  formPopupTitle = 'Agregar';
  gridColumns: any[] = [];

  refreshButtonOptions = {
    text: 'Actualizar',
    icon: 'refresh',
    stylingMode: 'text',
    onClick: () => this.consultar(),
  };

  constructor(
    public override appInfoService: AppInfoService,
    public override router: ActivatedRoute,
    private service: ScTestService,
  ) {
    super(appInfoService, router);
    this.columns = this.service.getColumns();
    //this.summary = this.service.getSummary(); //llamar el total de registros en la tabla pero no tiene sentido
    this.items = this.service.getItems();
    this.gridColumns = this.buildGridColumns();
  }

  ngOnInit(): void {
    this.inicializaOpciones();
    this.llenaComboBox();
    this.consultar();
  }

  inicializaOpciones(): void {}

  llenaComboBox(): void {}

  private buildGridColumns(): any[] {
    return [
      ...this.columns,
      {
        type: 'buttons',
        caption: 'Acciones',
        cssClass: 'sguees-grid-col-actions sguees-grid-col-actions--premium',
        width: 104,
        minWidth: 104,
        allowResizing: false,
        fixed: true,
        fixedPosition: 'right',
        alignment: 'center',
        buttons: [
          {
            hint: 'Editar registro',
            icon: 'edit',
            stylingMode: 'text',
            cssClass: 'sguees-grid-action-edit',
            visible: () => this.permiteEdit,
            onClick: (e: any) => this.abrirModalEditar(e),
          },
          {
            hint: 'Eliminar registro',
            icon: 'trash',
            stylingMode: 'text',
            cssClass: 'sguees-grid-action-delete',
            visible: () => this.permiteDele,
            onClick: (e: any) => this.confirmarEliminar(e),
          },
        ],
      },
    ];
  }

  fillParam(xCORR_TIPO_MODALIDAD?: number): any {
    if (xCORR_TIPO_MODALIDAD == undefined) {
      xCORR_TIPO_MODALIDAD = 0;
    }
    return {
      CORR_TIPO_MODALIDAD: xCORR_TIPO_MODALIDAD,
    };
  }

  override fillData(xModel?: ScTest): ScTest {
    if (xModel !== undefined) {
      return {
        CORR_EMPRESA: xModel.CORR_EMPRESA,
        CORR_TIPO_MODALIDAD: xModel.CORR_TIPO_MODALIDAD,
        NOMBRE_TIPO_MODALIDAD: xModel.NOMBRE_TIPO_MODALIDAD,
        USUARIO_CREA: xModel.USUARIO_CREA,
        ESTACION_CREA: xModel.ESTACION_CREA,
        FECHA_CREA: xModel.FECHA_CREA,
        USUARIO_ACTU: xModel.USUARIO_ACTU,
        ESTACION_ACTU: xModel.ESTACION_ACTU,
        FECHA_ACTU: xModel.FECHA_ACTU,
      };
    }

    return {
      CORR_EMPRESA: 1,
      CORR_TIPO_MODALIDAD: 0,
      NOMBRE_TIPO_MODALIDAD: '',
      USUARIO_CREA: '',
      ESTACION_CREA: '',
      FECHA_CREA: new Date(),
      USUARIO_ACTU: '',
      ESTACION_ACTU: '',
      FECHA_ACTU: new Date(),
    };
  }

  consultar(): void {
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
              this.formPopupVisible = false;
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
                (item: any) =>
                  item.CORR_TIPO_MODALIDAD ===
                  response.Data.CORR_TIPO_MODALIDAD,
              );
              this.models[vIndex] = response.Data;
              this.AsignaStatus(UpdateType.Browse);
              this.formPopupVisible = false;
              this.notifyFx(
                'Registro modificado con exito!',
                NotifyType.Success,
              );
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
    super.cancelar(
      (item: any) =>
        item.CORR_TIPO_MODALIDAD === this.modelUpdate.CORR_TIPO_MODALIDAD,
    );
  }

  abrirModalAgregar(): void {
    this.formPopupTitle = 'Agregar';
    this.nuevo();
    this.formPopupVisible = true;
    setTimeout(() => this.setFocus(), 250);
  }

  abrirModalEditar(e: any): void {
    this.model = { ...e.row.data };
    this.formPopupTitle = 'Editar';
    this.editarClick({ event: { preventDefault: () => {} } });
    this.formPopupVisible = true;
  }

  onFormPopupVisibleChange(visible: boolean): void {
    this.formPopupVisible = visible;
  }

  cancelarModalFormulario(): void {
    if (this.isForm()) {
      super.cancelar(
        (item: any) =>
          item.CORR_TIPO_MODALIDAD === this.modelUpdate.CORR_TIPO_MODALIDAD,
      );
    }
    this.formPopupVisible = false;
  }

  onFormPopupHiding(): void {
    if (this.isForm()) {
      this.AsignaStatus(UpdateType.Browse);
      this.model = this.modelUpdate ?? this.fillData();
    }
  }

  confirmarEliminar(e: any): void {
    const registro = e.row.data as ScTest;
    const nombre = registro.NOMBRE_TIPO_MODALIDAD?.trim() || 'seleccionado';

    const dialogo = custom({
      title: 'Confirmar eliminación',
      messageHtml: `¿Desea eliminar el registro <strong>${nombre}</strong>?<br/><br/>Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Confirmar', type: 'danger', onClick: () => true },
        { text: 'Cancelar', onClick: () => false },
      ],
    });

    dialogo.show().then((confirmado: boolean) => {
      if (confirmado) {
        this.rowRemoving({
          data: registro,
          cancel: false,
          component: { refresh: () => this.consultar() },
        });
      }
    });
  }

  rowRemoving(e: any): void {
    this.service
      .delete(this.fillParam(e.data.CORR_TIPO_MODALIDAD))
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
            if (e.component?.refresh) {
              e.component.refresh();
            } else {
              this.consultar();
            }
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
    this.dataForm.instance
      .getEditor('CORR_TIPO_MODALIDAD')
      ?.option('readOnly', true);
    this.dataForm.instance
      .getEditor('NOMBRE_TIPO_MODALIDAD')
      ?.option('readOnly', true);
  }

  override setFocus(): void {
    setTimeout(() => {
      this.dataForm.instance.getEditor('NOMBRE_TIPO_MODALIDAD')?.focus();
    });
  }

  selectedLookUpLista(vRow: any): any {
    return vRow[0].Key;
  }
}
