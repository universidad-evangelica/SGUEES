// Qué hace: componente reutilizable de editor de texto enriquecido (HTML Editor).
// Cómo lo hace: encapsula dx-html-editor de DevExtreme con la barra de herramientas completa del demo Fluent Blue Light.
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnChanges, OnDestroy, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { DxDropDownButtonModule } from 'devextreme-angular/ui/drop-down-button';
import { DxHtmlEditorModule } from 'devextreme-angular/ui/html-editor';
import { DxPopoverModule } from 'devextreme-angular/ui/popover';
import { ThemeService } from 'src/app/shared/services/theme.service';

@Component({
  standalone: false,
	selector: 'app-text-editor',
	templateUrl: './text-editor.component.html',
	styleUrls: ['./text-editor.component.scss'],
})
export class TextEditorComponent implements OnInit, OnChanges, OnDestroy {
	@Input() value: string = '';
	@Input() height: number | string = 420;
	@Input() readOnly: boolean = false;
	@Input() placeholder: string = 'Escriba el contenido del correo aquí...';
	@Input() parametros: Array<{ key: string; label: string; descripcion?: string; tipo?: string }> = [];
	@Input() formatoParametro: { bold?: boolean; color?: string; size?: string } = {
		bold: true,
		color: '#000000',
		size: '12pt',
	};
	@Output() valueChange = new EventEmitter<string>();

	quillInstance: any;
	opcionesBotonParametros: any = null;
	menuParametrosVisible: boolean = false;
	filtroParametro: string = '';
	parametrosFiltrados: Array<{ key: string; label: string; descripcion?: string; tipo?: string }> = [];
	esPlantillaActiva: boolean = false;
	private isSyncingDiseno = false;
	private pendingSyncDiseno = false;
	private dropDownButtonInstance: any = null;
	private ultimaSeleccion: { index: number; length: number } | null = null;
	private themeSubscription?: Subscription;
	private editorInstance: any = null;
	private boundQuillInstance: any = null;
	private boundQuillRoot: HTMLElement | null = null;
	private linkDialogPatched: boolean = false;
	private ultimoValorEmitido: string | undefined = undefined;

	constructor(@Optional() private themeService?: ThemeService) {}

	// Qué hace: determina si la aplicación se encuentra actualmente en modo oscuro.
	// Cómo lo hace: consulta el servicio ThemeService o evalúa la presencia de clases oscuras en el body del documento.
	get isDark(): boolean {
		return (
			this.themeService?.currentTheme === 'dark' ||
			document.body.classList.contains('sguees-theme-dark') ||
			document.body.classList.contains('dx-color-scheme-dark')
		);
	}

	// Qué hace: genera dinámicamente las clases del contenedor del popover de parámetros.
	// Cómo lo hace: combina la clase base con modo-oscuro o modo-claro según el estado actual del tema.
	get popoverWrapperAttr(): Record<string, string> {
		return {
			class: `editor-parametros-popover-wrapper ${this.isDark ? 'modo-oscuro' : 'modo-claro'}`,
		};
	}

	// Qué hace: cierra el panel desplegable de parámetros únicamente cuando el usuario interactúa fuera de él en la página externa.
	// Cómo lo hace: verifica si el target soporta closest y pertenece al popover o botón de activación; si no pertenece, cancela el cierre.
	private cerrarMenuParametrosSiAplica = (e: Event): void => {
		const target = e.target as HTMLElement | null;
		if (
			target &&
			typeof target.closest === 'function' &&
			(target.closest('.editor-parametros-popover-wrapper') ||
				target.closest('.dx-popover') ||
				target.closest('.dx-popover-wrapper') ||
				target.closest('.dx-overlay-content') ||
				target.closest('.parametros-panel-container') ||
				target.closest('.panel-cards-list') ||
				target.closest('.editor-toolbar-parametros-btn'))
		) {
			return;
		}

		if (this.menuParametrosVisible) {
			this.menuParametrosVisible = false;
		}
	};

	// Qué hace: handler para el evento text-change de Quill manteniendo el diseño institucional.
	// Cómo lo hace: programa sincronización visual en cambios originados por el usuario sobre la instancia viva de Quill.
	private textChangeHandler = (_delta: any, _oldDelta: any, source: string) => {
		if (source !== 'user') return;
		const quill = this.obtenerQuillActivo();
		if (quill) {
			this.programarSincronizacionDiseno(quill, 20);
		}
	};

	// Qué hace: handler para el evento selection-change de Quill.
	// Cómo lo hace: conserva el último rango de selección válido emitido por Quill.
	private selectionChangeHandler = (range: any) => {
		if (range && typeof range.index === 'number') {
			this.ultimaSeleccion = range;
		}
	};

	// Qué hace: handler para el evento dragstart del documento.
	// Cómo lo hace: delega la ejecución al método handleDragStart conservando la referencia de la función.
	private dragStartHandler = (e: DragEvent) => this.handleDragStart(e);

	// Qué hace: handler para el evento dragover sobre el lienzo de Quill.
	// Cómo lo hace: delega la ejecución al método handleDragOver conservando la referencia de la función.
	private dragOverHandler = (e: DragEvent) => this.handleDragOver(e);

	// Qué hace: handler para el evento drop sobre el lienzo de Quill.
	// Cómo lo hace: delega la ejecución al método handleDrop conservando la referencia de la función.
	private dropHandler = (e: DragEvent) => this.handleDrop(e);

	// Qué hace: handler para el evento mousedown sobre el lienzo de Quill.
	// Cómo lo hace: delega la ejecución al método handleMouseDown conservando la referencia de la función.
	private mouseDownHandler = (e: MouseEvent) => this.handleMouseDown(e);

	// Qué hace: handler para el evento paste sobre el lienzo de Quill.
	// Cómo lo hace: delega la ejecución al método handlePaste conservando la referencia de la función para poder remover el listener.
	private pasteHandler = (e: ClipboardEvent) => this.handlePaste(e);

	ngOnInit(): void {
		this.actualizarOpcionesBotonParametros();
		this.evaluarEstadoPlantilla(this.value);
		this.themeSubscription = this.themeService?.isDark.subscribe(() => {
			this.actualizarOpcionesBotonParametros();
		});
		document.addEventListener('dragstart', this.dragStartHandler);
		// Qué hace: escucha eventos de scroll y wheel en la ventana para cerrar el menú de parámetros automáticamente.
		// Cómo lo hace: añade listeners globales con capture true para interceptar cualquier desplazamiento de la página.
		window.addEventListener('scroll', this.cerrarMenuParametrosSiAplica, true);
		window.addEventListener('wheel', this.cerrarMenuParametrosSiAplica, { capture: true, passive: true });
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['parametros'] || changes['readOnly']) {
			this.actualizarOpcionesBotonParametros();
		}
		if (changes['value']) {
			const val = changes['value'].currentValue;
			const esCambioExterno = val !== this.ultimoValorEmitido;
			if (esCambioExterno) {
				this.ultimaSeleccion = null;
				this.ultimoValorEmitido = val;
			}
			this.evaluarEstadoPlantilla(val);
			if (this.esValorPlantillaInstitucional(val)) {
				setTimeout(() => {
					const quill = this.obtenerQuillActivo();
					if (quill) {
						this.sincronizarDisenoInstitucional(quill);
						this.posicionarEnTarjetaCentral(esCambioExterno);
					}
				}, 80);
			}
		}
	}

	ngOnDestroy(): void {
		this.themeSubscription?.unsubscribe();
		document.removeEventListener('dragstart', this.dragStartHandler);
		window.removeEventListener('scroll', this.cerrarMenuParametrosSiAplica, true);
		window.removeEventListener('wheel', this.cerrarMenuParametrosSiAplica, true);
		this.desenlazarEventosQuill();
	}

	// Qué hace: intercepta el inicio de arrastre de un parámetro dinámico desde el menú desplegable o la lista de tarjetas.
	// Cómo lo hace: lee el atributo data-token del elemento arrastrado identificando .parametro-card-item o .parametro-dropdown-item y lo transfiere como texto plano.
	private handleDragStart(e: DragEvent): void {
		const target = (e.target as HTMLElement)?.closest('.parametro-card-item, .parametro-dropdown-item') as HTMLElement;
		if (target) {
			const token = target.getAttribute('data-token');
			if (token && e.dataTransfer) {
				e.dataTransfer.setData('text/plain', token);
				e.dataTransfer.effectAllowed = 'copy';
			}
		}
	}

	// Qué hace: permite arrastrar parámetros sobre el lienzo del editor y dibuja el cursor de texto parpadeante en tiempo real bajo el ratón.
	// Cómo lo hace: intercepta dragover, asigna dropEffect en copy y actualiza la selección visual del navegador dentro de la tarjeta o párrafos para mostrar la barra de inserción.
	private handleDragOver(e: DragEvent): void {
		if (this.readOnly) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'copy';
		}

		const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
		const tablaOcelda = elementUnderPointer?.closest('.plantilla-uees-table, table, td');
		const tdCentral = (tablaOcelda?.tagName === 'TD' ? tablaOcelda : tablaOcelda?.querySelector('td')) as HTMLElement;

		if (tdCentral) {
			const lineElements = Array.from(tdCentral.querySelectorAll('p, .ql-table-cell-line')) as HTMLElement[];
			if (lineElements.length > 0) {
				const primerP = lineElements[0];
				const ultimoP = lineElements[lineElements.length - 1];
				const primerRect = primerP.getBoundingClientRect();
				const ultimoRect = ultimoP.getBoundingClientRect();
				const sel = window.getSelection();

				if (sel) {
					if (e.clientY <= primerRect.top + 6) {
						const r = document.createRange();
						const target = primerP.firstChild || primerP;
						r.setStart(target, 0);
						r.collapse(true);
						sel.removeAllRanges();
						sel.addRange(r);
						return;
					}

					if (e.clientY >= ultimoRect.bottom - 4) {
						const r = document.createRange();
						const target = ultimoP.lastChild || ultimoP;
						const offset = target.nodeType === Node.TEXT_NODE ? (target.textContent?.length ?? 0) : target.childNodes.length;
						r.setStart(target, offset);
						r.collapse(true);
						sel.removeAllRanges();
						sel.addRange(r);
						return;
					}
				}
			}
		}

		if (document.caretRangeFromPoint) {
			const range = document.caretRangeFromPoint(e.clientX, e.clientY);
			if (range) {
				const sel = window.getSelection();
				if (sel) {
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}
	}

	// Qué hace: inserta el token del parámetro soltado en la posición exacta del puntero garantizando permanencia en la tarjeta central.
	// Cómo lo hace: intercepta drops en captura sobre el lienzo vivo de Quill, resuelve el índice real de destino e inyecta el token con su formato.
	private handleDrop(e: DragEvent): void {
		const quill = this.obtenerQuillActivo();
		if (!quill || this.readOnly) return;
		const token = e.dataTransfer?.getData('text/plain');
		if (!token || !token.startsWith('{{') || !token.endsWith('}}')) return;

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		let dropIndex = -1;

		// 1. Verificar si el drop cayó dentro de una celda o tabla de la plantilla
		const elementUnderPointer =
			(document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null) ||
			(e.target as HTMLElement | null);
		const celdaDirecta = elementUnderPointer?.closest('td, th') as HTMLElement | null;
		const tablaContenedora = elementUnderPointer?.closest('.plantilla-uees-table, table') as HTMLElement | null;
		const tdDestino = celdaDirecta || (tablaContenedora?.querySelector('td, th') as HTMLElement | null);

		if (tdDestino) {
			const indiceCelda = this.obtenerIndiceInternoCelda(tdDestino, e.clientY, e.clientX, quill);
			if (indiceCelda !== null && indiceCelda >= 0) {
				dropIndex = indiceCelda;
			}
		}

		// 2. Fallback por rango nativo si no cayó dentro de una tabla
		if (dropIndex < 0) {
			let nativeRange: Range | null = null;
			if (document.caretRangeFromPoint) {
				nativeRange = document.caretRangeFromPoint(e.clientX, e.clientY);
			} else {
				const sel = window.getSelection();
				if (sel && sel.rangeCount > 0) {
					nativeRange = sel.getRangeAt(0);
				}
			}

			const indiceRange = this.resolverIndiceDesdeRange(quill, nativeRange);
			if (indiceRange !== null && indiceRange >= 0) {
				dropIndex = indiceRange;
			}
		}

		// 3. Fallback de seguridad si no se resolvió posición
		if (dropIndex < 0) {
			dropIndex = this.obtenerIndiceInsercionValido(quill);
		}

		this.insertarTokenEnIndice(quill, token, dropIndex, 0, true);
	}

	// Qué hace: asegura que al hacer clic en el relleno exterior vacío de una celda se enfoque el editor sin mover clics válidos del usuario.
	// Cómo lo hace: verifica si el clic cayó directamente en la celda TD vacía sin que exista selección; si el usuario hizo clic en texto o en la línea, respeta la posición del navegador.
	private handleMouseDown(e: MouseEvent): void {
		const quill = this.obtenerQuillActivo();
		if (this.readOnly || !quill) return;
		const target = e.target as HTMLElement;
		// Solo intervenir si el clic fue directamente sobre el TD o TABLE vacío (relleno exterior)
		if (target.tagName === 'TD' || target.tagName === 'TABLE' || target.tagName === 'TR' || target.tagName === 'TBODY') {
			setTimeout(() => {
				const quillActual = this.obtenerQuillActivo();
				if (!quillActual) return;
				const selection = quillActual.getSelection?.(false);
				if (!selection) {
					const td = (target.tagName === 'TD' ? target : target.querySelector('td')) as HTMLElement;
					if (td) {
						const indice = this.obtenerIndiceInternoCelda(td, e.clientY, e.clientX, quillActual);
						if (indice !== null) {
							this.ultimaSeleccion = { index: indice, length: 0 };
							try {
								quillActual.setSelection(indice, 0, 'user');
							} catch {}
						}
					}
				}
			}, 30);
		}
	}

	// Qué hace: convierte un Range nativo del navegador en un índice lineal seguro dentro del documento de Quill.
	// Cómo lo hace: utiliza el normalizador nativo de Quill cuando está disponible o resuelve el nodo de texto mediante scroll.find.
	private resolverIndiceDesdeRange(quill: any, range: Range | null): number | null {
		if (!quill || !range?.startContainer) return null;

		if (
			quill.selection &&
			typeof quill.selection.normalizeNative === 'function' &&
			typeof quill.selection.normalizedToRange === 'function'
		) {
			try {
				const normalized = quill.selection.normalizeNative(range);
				const qRange = normalized ? quill.selection.normalizedToRange(normalized) : null;
				if (qRange && typeof qRange.index === 'number') {
					return qRange.index;
				}
			} catch {}
		}

		try {
			let targetNode: Node = range.startContainer;
			let targetOffset = range.startOffset;

			if (targetNode.nodeType === Node.ELEMENT_NODE && targetNode.childNodes.length > 0) {
				const childIndex = Math.min(targetOffset, targetNode.childNodes.length - 1);
				const child = targetNode.childNodes[childIndex];
				const alFinal = targetOffset >= targetNode.childNodes.length;
				targetNode = child;
				targetOffset = alFinal ? (child.textContent?.length ?? 0) : 0;
			}

			const blot = quill.scroll?.find(targetNode, true);
			if (blot && typeof blot.offset === 'function') {
				const base = blot.offset(quill.scroll);
				if (targetNode.nodeType === Node.TEXT_NODE) {
					const len = typeof blot.length === 'function' ? blot.length() : (targetNode.textContent?.length ?? 0);
					return base + Math.min(targetOffset, len);
				}
				return base;
			}
		} catch (err) {
			console.warn('Error al resolver offset desde Range en Quill:', err);
		}

		return null;
	}

	// Qué hace: obtiene el índice lineal en Quill al inicio o al final de un párrafo o línea de celda.
	// Cómo lo hace: resuelve el blot completo del bloque de línea para abarcar todos sus segmentos con formato y parámetros previos.
	private obtenerIndiceDeLineaBlot(quill: any, linea: HTMLElement, alFinal: boolean = true): number | null {
		if (!quill?.scroll || !linea) return null;

		const blockBlot = quill.scroll.find(linea, true);
		if (blockBlot && typeof blockBlot.offset === 'function') {
			const baseOffset = blockBlot.offset(quill.scroll);
			if (!alFinal) return baseOffset;
			const blotLength = typeof blockBlot.length === 'function' ? blockBlot.length() : 0;
			return baseOffset + Math.max(0, blotLength - 1);
		}

		const fallbackBlot = linea.firstChild ? quill.scroll.find(linea.firstChild, true) : null;
		if (fallbackBlot && typeof fallbackBlot.offset === 'function') {
			const baseOffset = fallbackBlot.offset(quill.scroll);
			if (!alFinal) return baseOffset;
			const blotLength = typeof fallbackBlot.length === 'function' ? fallbackBlot.length() : 0;
			return baseOffset + Math.max(0, blotLength - 1);
		}

		return null;
	}

	// Qué hace: localiza la posición editable exacta dentro de una celda de tabla distinguiendo inicio, renglones y final.
	// Cómo lo hace: evalúa coordenadas en relleno superior/inferior o caretRangeFromPoint cuando hay puntero; sin puntero apunta al final del último bloque editable.
	private obtenerIndiceInternoCelda(td: HTMLElement, clientY?: number, clientX?: number, quillArg?: any): number | null {
		const quill = quillArg || this.obtenerQuillActivo();
		if (!td || !quill?.scroll) return null;

		const lineElements = Array.from(td.querySelectorAll('p, .ql-table-cell-line')) as HTMLElement[];
		if (lineElements.length === 0) {
			const targetChild = td.firstElementChild || td.firstChild || td;
			const blot = quill.scroll.find(targetChild, true);
			return blot && typeof blot.offset === 'function' ? blot.offset(quill.scroll) : null;
		}

		const primerP = lineElements[0];
		const ultimoP = lineElements[lineElements.length - 1];

		if (typeof clientY !== 'number') {
			return this.obtenerIndiceDeLineaBlot(quill, ultimoP, true);
		}

		// 1. Verificar si cayó en el relleno superior o inferior de la celda
		const primerRect = primerP.getBoundingClientRect();
		if (clientY <= primerRect.top + 6) {
			return this.obtenerIndiceDeLineaBlot(quill, primerP, false) ?? 0;
		}

		const ultimoRect = ultimoP.getBoundingClientRect();
		if (clientY >= ultimoRect.bottom - 4) {
			const finUltimo = this.obtenerIndiceDeLineaBlot(quill, ultimoP, true);
			if (finUltimo !== null) {
				return finUltimo;
			}
		}

		// 2. Intentar resolución exacta por coordenadas intermedias dentro de la celda
		if (typeof clientX === 'number' && document.caretRangeFromPoint) {
			const range = document.caretRangeFromPoint(clientX, clientY);
			if (range && range.startContainer && td.contains(range.startContainer)) {
				const indiceExacto = this.resolverIndiceDesdeRange(quill, range);
				if (indiceExacto !== null) {
					return indiceExacto;
				}
			}
		}

		// 3. Fallback: encontrar el párrafo verticalmente más cercano
		let targetP = primerP;
		let menorDistancia = Infinity;
		for (const p of lineElements) {
			const rect = p.getBoundingClientRect();
			const centroY = (rect.top + rect.bottom) / 2;
			const distancia = Math.abs(clientY - centroY);
			if (distancia < menorDistancia) {
				menorDistancia = distancia;
				targetP = p;
			}
		}

		return this.obtenerIndiceDeLineaBlot(quill, targetP, true);
	}

	// Qué hace: localiza la celda editable correspondiente al cuerpo central de la plantilla institucional.
	// Cómo lo hace: busca td.content o la tabla marcada como cuerpo (o la segunda tabla en el diseño de tres bloques).
	private resolverCeldaCuerpoInstitucional(quill: any): HTMLElement | null {
		if (!quill?.root) return null;

		const tdContent = quill.root.querySelector('td.content') as HTMLElement | null;
		if (tdContent) return tdContent;

		const tables = Array.from(quill.root.querySelectorAll('table')) as HTMLTableElement[];
		if (tables.length === 0) return null;

		const tablaCentral =
			tables.find((t) => t.getAttribute('data-tipo') === 'cuerpo') ||
			(tables.length >= 2 ? tables[1] : tables[0]);

		return (tablaCentral?.querySelector('td, th') as HTMLElement | null) || null;
	}

	// Qué hace: verifica si un índice de Quill apunta dentro de la tabla de encabezado institucional.
	// Cómo lo hace: obtiene la hoja DOM en ese índice y comprueba si pertenece a la tabla marcada como encabezado o primera tabla multipanel.
	private estaIndiceEnEncabezado(quill: any, index: number): boolean {
		try {
			const [leaf] = quill?.getLeaf?.(index) || [];
			const domNode = leaf?.domNode as Node | undefined;
			const el = domNode?.nodeType === Node.ELEMENT_NODE ? (domNode as HTMLElement) : domNode?.parentElement;
			const tbl = el?.closest('table');
			if (!tbl) return false;
			if (tbl.getAttribute('data-tipo') === 'encabezado') return true;
			const tables = Array.from(quill.root?.querySelectorAll('table') || []);
			return tables.length >= 2 && tbl === tables[0] && this.esPlantillaInstitucional(quill);
		} catch {
			return false;
		}
	}

	// Qué hace: posiciona la selección activa y el cursor de texto dentro de la tarjeta central blanca de contenido institucional.
	// Cómo lo hace: localiza la celda del cuerpo mediante resolverCeldaCuerpoInstitucional y ubica ultimaSeleccion en el último renglón editable.
	private posicionarEnTarjetaCentral(forzar: boolean = false): void {
		const quill = this.obtenerQuillActivo();
		if (!quill?.root || quill.hasFocus?.()) return;
		if (!forzar && this.ultimaSeleccion) return;

		const tdCuerpo = this.resolverCeldaCuerpoInstitucional(quill);
		if (!tdCuerpo) return;

		const indice = this.obtenerIndiceInternoCelda(tdCuerpo, undefined, undefined, quill);
		if (indice !== null) {
			this.ultimaSeleccion = { index: indice, length: 0 };
			try {
				quill.setSelection(indice, 0, 'silent');
			} catch {}
		}
	}

	// Qué hace: calcula la posición adecuada y segura donde insertar un parámetro en el editor.
	// Cómo lo hace: prioriza la selección activa acotada, descarta selecciones obsoletas o en el encabezado, y recurre a la celda del cuerpo o final del contenido.
	private obtenerIndiceInsercionValido(quillArg?: any): number {
		const quill = quillArg || this.obtenerQuillActivo();
		if (!quill) return 0;

		const maxIndex = Math.max(0, (typeof quill.getLength === 'function' ? quill.getLength() : 1) - 1);
		const selection = quill.getSelection?.(false);
		if (selection && typeof selection.index === 'number') {
			const indiceActual = Math.max(0, Math.min(selection.index, maxIndex));
			this.ultimaSeleccion = { index: indiceActual, length: selection.length ?? 0 };
			return indiceActual;
		}

		if (this.ultimaSeleccion && typeof this.ultimaSeleccion.index === 'number') {
			const indicePrevio = Math.max(0, Math.min(this.ultimaSeleccion.index, maxIndex));
			if (!this.estaIndiceEnEncabezado(quill, indicePrevio)) {
				return indicePrevio;
			}
		}

		const tdCuerpo = this.resolverCeldaCuerpoInstitucional(quill);
		if (tdCuerpo) {
			const indice = this.obtenerIndiceInternoCelda(tdCuerpo, undefined, undefined, quill);
			if (indice !== null) {
				return Math.max(0, Math.min(indice, maxIndex));
			}
		}

		return maxIndex;
	}

	// Qué hace: sincroniza la lista filtrada de parámetros visibles en el panel desplegable.
	// Cómo lo hace: evalúa el criterio filtroParametro contra label, key y descripción sin recrear el botón de la barra.
	private filtrarParametros(): void {
		const query = this.filtroParametro.trim().toLowerCase();
		if (!query) {
			this.parametrosFiltrados = [...(this.parametros || [])];
			return;
		}
		this.parametrosFiltrados = (this.parametros || []).filter(
			(p) =>
				(p.label && p.label.toLowerCase().includes(query)) ||
				(p.key && p.key.toLowerCase().includes(query)) ||
				(p.descripcion && p.descripcion.toLowerCase().includes(query))
		);
	}

	// Qué hace: configura el botón desplegable de parámetros en la barra evitando invalidaciones innecesarias de Quill.
	// Cómo lo hace: inicializa opcionesBotonParametros una sola vez y solo genera una nueva referencia si cambia el estado readOnly.
	private actualizarOpcionesBotonParametros(): void {
		this.filtrarParametros();

		if (!this.opcionesBotonParametros) {
			this.opcionesBotonParametros = {
				text: 'Parámetros',
				icon: 'mention',
				stylingMode: 'text',
				height: 24,
				disabled: this.readOnly,
				elementAttr: {
					class: 'editor-toolbar-parametros-btn',
				},
				onClick: () => {
					this.menuParametrosVisible = !this.menuParametrosVisible;
				},
			};
			return;
		}

		if (this.opcionesBotonParametros.disabled !== this.readOnly) {
			this.opcionesBotonParametros = {
				...this.opcionesBotonParametros,
				disabled: this.readOnly,
			};
		}
	}

	// Qué hace: filtra dinámicamente los parámetros disponibles por título, clave o descripción.
	// Cómo lo hace: actualiza filtroParametro e invoca filtrarParametros para refrescar la lista visible.
	onSearchInput(e: any): void {
		this.filtroParametro = e?.target?.value ?? '';
		this.filtrarParametros();
	}

	// Qué hace: limpia el campo de búsqueda de parámetros y restaura la lista completa.
	// Cómo lo hace: restablece filtroParametro a vacío y ejecuta filtrarParametros.
	limpiarFiltro(): void {
		this.filtroParametro = '';
		this.filtrarParametros();
	}

	// Qué hace: inserta el parámetro en el cursor al hacer clic sobre una tarjeta y oculta el panel.
	// Cómo lo hace: invoca insertarParametroEnCursor y asigna false a menuParametrosVisible.
	onParamCardClick(item: any): void {
		this.insertarParametroEnCursor(item);
		this.menuParametrosVisible = false;
	}

	// Qué hace: transfiere el token del parámetro arrastrado para inserción nativa en el editor.
	// Cómo lo hace: coloca el texto plano {{TOKEN}} en dataTransfer con efecto copy.
	onParamDragStart(e: DragEvent, item: any): void {
		const token = this.getParamToken(item.key);
		if (e.dataTransfer) {
			e.dataTransfer.setData('text/plain', token);
			e.dataTransfer.effectAllowed = 'copy';
		}
	}

	// Qué hace: genera la representación en texto del token dinámico.
	// Cómo lo hace: concatena los delimitadores de llaves dobles con la clave del parámetro de forma segura.
	getParamToken(key?: string): string {
		return key ? `{{${key}}}` : '';
	}

	// Qué hace: inserta el token del parámetro en la posición actual del cursor con formato tipográfico (negrita, color negro y tamaño 12).
	// Cómo lo hace: obtiene la instancia viva de Quill, calcula el índice seguro de inserción y delega en insertarTokenEnIndice.
	insertarParametroEnCursor(item: any): void {
		const quill = this.obtenerQuillActivo();
		if (!item?.key || !quill || this.readOnly) {
			return;
		}
		const token = `{{${item.key}}}`;
		const index = this.obtenerIndiceInsercionValido(quill);
		const length =
			this.ultimaSeleccion &&
			this.ultimaSeleccion.index === index &&
			this.ultimaSeleccion.length > 0
				? this.ultimaSeleccion.length
				: 0;

		this.insertarTokenEnIndice(quill, token, index, length, false);
	}

	// Qué hace: inserta un token de parámetro en una posición dada de Quill, aplica formato y actualiza cursor y foco.
	// Cómo lo hace: acota el índice al rango válido del documento, reemplaza selección si existe, inserta con formato y refuerza estilos.
	private insertarTokenEnIndice(
		quill: any,
		token: string,
		index: number,
		length: number = 0,
		cerrarMenu: boolean = false
	): void {
		const maxIndex = Math.max(0, (typeof quill.getLength === 'function' ? quill.getLength() : 1) - 1);
		const indiceSeguro = Math.max(0, Math.min(index, maxIndex));

		quill.focus();

		if (length > 0) {
			const maxBorrado = Math.max(0, maxIndex - indiceSeguro);
			if (maxBorrado > 0) {
				quill.deleteText(indiceSeguro, Math.min(length, maxBorrado), 'user');
			}
		}

		const formatos: Record<string, any> = {
			bold: this.formatoParametro?.bold ?? true,
			color: this.formatoParametro?.color ?? '#000000',
			size: this.formatoParametro?.size ?? '12pt',
		};

		quill.insertText(indiceSeguro, token, formatos, 'user');
		this.aplicarFormatoParametro(indiceSeguro, token.length, quill);
		const nuevoIndex = indiceSeguro + token.length;
		quill.setSelection(nuevoIndex, 0, 'user');
		this.ultimaSeleccion = { index: nuevoIndex, length: 0 };

		if (cerrarMenu) {
			this.menuParametrosVisible = false;
		}
		if (this.dropDownButtonInstance && typeof this.dropDownButtonInstance.close === 'function') {
			this.dropDownButtonInstance.close();
		}
		setTimeout(() => {
			this.obtenerQuillActivo()?.focus?.();
		}, 60);
	}

	// Qué hace: aplica y refuerza el formato tipográfico predeterminado (negrita, color negro y tamaño 12) sobre el rango exacto del token insertado.
	// Cómo lo hace: aplica de forma directa e individual bold, color y size en la instancia activa de Quill garantizando que no se pierdan ante estilos de tema oscuro.
	private aplicarFormatoParametro(index: number, length: number, quillArg?: any): void {
		const quill = quillArg || this.obtenerQuillActivo();
		if (!quill || length <= 0) return;
		const bold = this.formatoParametro?.bold ?? true;
		const color = this.formatoParametro?.color ?? '#000000';
		const size = this.formatoParametro?.size ?? '12pt';

		try {
			if (bold) {
				quill.formatText(index, length, 'bold', true, 'user');
			}
			if (color) {
				quill.formatText(index, length, 'color', color, 'user');
			}
			if (size) {
				quill.formatText(index, length, 'size', size, 'user');
			}
		} catch (err) {
			console.warn('Error al aplicar formato predeterminado al parámetro:', err);
		}
	}

	// Qué hace: detecta si una cadena HTML corresponde a una estructura de plantilla institucional UEES.
	// Cómo lo hace: evalúa los marcadores de clase, dominio y atributos de bloque propios del formato institucional.
	private esValorPlantillaInstitucional(val?: string | null): boolean {
		if (typeof val !== 'string') return false;
		return (
			val.includes('plantilla-uees') ||
			val.includes('universidad evang') ||
			val.includes('uees.edu.sv') ||
			val.includes('data-tipo')
		);
	}

	onValueChange(val: string): void {
		this.value = val;
		this.ultimoValorEmitido = val;
		this.evaluarEstadoPlantilla(val);
		this.valueChange.emit(val);
		const quill = this.obtenerQuillActivo();
		if (quill && this.esValorPlantillaInstitucional(val)) {
			this.programarSincronizacionDiseno(quill, 40);
		}
	}

	// Qué hace: evalúa si el contenido actual corresponde a una plantilla institucional oficial UEES.
	// Cómo lo hace: verifica la presencia de palabras clave institucionales en la cadena de valor o en el DOM de Quill.
	private evaluarEstadoPlantilla(val?: string): void {
		const str = (typeof val === 'string' ? val : this.value || '').toLowerCase();
		this.esPlantillaActiva =
			str.includes('plantilla-uees') ||
			str.includes('universidad evang') ||
			str.includes('uees.edu.sv') ||
			str.includes('2275-4000') ||
			str.includes('#063b79') ||
			str.includes('#ffcc00') ||
			str.includes('data-tipo') ||
			this.esPlantillaInstitucional(this.quillInstance);
	}

	// Qué hace: determina si el documento del editor contiene la plantilla institucional oficial UEES.
	// Cómo lo hace: evalúa la presencia de textos institucionales inmutables (Universidad Evangélica, uees.edu.sv, 2275-4000), logotipo o atributos data-tipo.
	private esPlantillaInstitucional(quill: any): boolean {
		if (!quill?.root) return false;
		const text = (quill.root.innerText || quill.root.textContent || '').toLowerCase();
		const html = quill.root.innerHTML || '';
		return (
			text.includes('universidad evang') ||
			text.includes('uees.edu.sv') ||
			text.includes('2275-4000') ||
			html.includes('plantilla-uees') ||
			html.includes('data-tipo') ||
			!!quill.root.querySelector('img')
		);
	}

	// Qué hace: determina si una tabla dada pertenece al formato institucional UEES.
	// Cómo lo hace: verifica clases, data-tipo, logo, colores o si el documento raíz pertenece a la plantilla institucional UEES.
	private esTablaInstitucional(tbl: HTMLTableElement | null): boolean {
		if (!tbl) return false;
		if (
			tbl.classList.contains('plantilla-uees-table') ||
			tbl.classList.contains('plantilla-uees-pie') ||
			!!tbl.getAttribute('data-tipo') ||
			tbl.style.maxWidth === '680px' ||
			!!tbl.querySelector('img')
		) {
			return true;
		}

		const text = (tbl.innerText || tbl.textContent || '').toLowerCase();
		if (text.includes('universidad evang') || text.includes('uees.edu.sv') || text.includes('2275-4000')) {
			return true;
		}

		const html = tbl.innerHTML || '';
		if (/#063b79|#ffcc00|rgb\(\s*6,\s*59,\s*121\s*\)|rgb\(\s*255,\s*204,\s*0\s*\)/i.test(html)) {
			return true;
		}

		return this.esPlantillaInstitucional(this.quillInstance);
	}

	// Qué hace: resuelve la tabla institucional a partir del cursor de Quill cuando el evento paste no apunta al td.
	// Cómo lo hace: obtiene el leaf en el índice de selección o ultimaSeleccion y sube hasta el table contenedor.
	private obtenerTablaDesdeSeleccion(quill: any): HTMLTableElement | null {
		const rango = quill?.getSelection?.(true) || this.ultimaSeleccion;
		if (!rango || typeof rango.index !== 'number' || !quill?.getLeaf) {
			return null;
		}
		try {
			const leafInfo = quill.getLeaf(rango.index);
			const leaf = Array.isArray(leafInfo) ? leafInfo[0] : leafInfo;
			const node = leaf?.domNode as Node;
			const el = (node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement)) as HTMLElement;
			return (el?.closest?.('table') as HTMLTableElement) || null;
		} catch {
			return null;
		}
	}

	// Qué hace: extrae el texto del portapapeles sin tablas ni markup de Word para insertarlo dentro de la celda.
	// Cómo lo hace: prioriza text/plain y, si solo hay HTML, convierte innerText conservando saltos de línea.
	private extraerTextoPegado(html: string, text: string): string {
		const plano = (text || '').replace(/\r\n/g, '\n');
		if (plano.trim().length > 0) {
			return plano;
		}
		if (!html) {
			return '';
		}
		const contenedor = document.createElement('div');
		contenedor.innerHTML = html;
		contenedor.querySelectorAll('style, script, meta, xml, link').forEach((el) => el.remove());
		return (contenedor.innerText || contenedor.textContent || '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');
	}

	// Qué hace: intercepta el pegado dentro de los recuadros institucionales para no dejar que Quill reescriba la tabla.
	// Cómo lo hace: en fase captura, si el destino es una celda institucional, cancela el pegado nativo, inserta texto plano en el índice actual y reprograma la sincronización de colores y clase.
	private handlePaste(e: ClipboardEvent): void {
		const quill = this.obtenerQuillActivo();
		if (!quill || this.readOnly) {
			return;
		}

		const origen = (e.target as HTMLElement) || null;
		const celda = (origen?.closest?.('td, th') as HTMLElement) || null;
		let tabla = (celda?.closest('table') as HTMLTableElement) || null;
		if (!this.esTablaInstitucional(tabla)) {
			tabla = this.obtenerTablaDesdeSeleccion(quill);
		}

		if (!this.esTablaInstitucional(tabla)) {
			this.programarSincronizacionDiseno(quill, 30);
			this.programarSincronizacionDiseno(quill, 150);
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		const html = e.clipboardData?.getData('text/html') ?? '';
		const text = e.clipboardData?.getData('text/plain') ?? '';
		const contenido = this.extraerTextoPegado(html, text);
		if (!contenido) {
			this.programarSincronizacionDiseno(quill, 30);
			return;
		}

		const rango = quill.getSelection(true) || this.ultimaSeleccion;
		const index = rango && typeof rango.index === 'number' ? rango.index : this.obtenerIndiceInsercionValido(quill);
		const length = rango && typeof rango.length === 'number' ? rango.length : 0;

		try {
			quill.focus();
			if (length > 0) {
				quill.deleteText(index, length, 'user');
			}
			quill.insertText(index, contenido, 'user');
			const nuevoIndex = index + contenido.length;
			quill.setSelection(nuevoIndex, 0, 'user');
			this.ultimaSeleccion = { index: nuevoIndex, length: 0 };
		} catch (err) {
			console.warn('Error al pegar texto en celda institucional:', err);
		}

		// Qué hace: restablece inmediatamente el diseño institucional de forma síncrona y con micro-delay de seguridad.
		// Cómo lo hace: ejecuta sincronizarDisenoInstitucional en el mismo tick para que no se aprecie parpadeo ni pérdida de colores.
		this.sincronizarDisenoInstitucional(quill);
		this.programarSincronizacionDiseno(quill, 20);
		this.programarSincronizacionDiseno(quill, 100);
	}

	// Qué hace: agenda la restauración del diseño institucional evitando que la guarda de reentrancia descarte un pegado posterior.
	// Cómo lo hace: si isSyncingDiseno está activo marca pendingSyncDiseno; si no, ejecuta sincronizarDisenoInstitucional tras el delay indicado.
	private programarSincronizacionDiseno(quill: any, delay: number = 20): void {
		setTimeout(() => {
			if (this.isSyncingDiseno) {
				this.pendingSyncDiseno = true;
				return;
			}
			this.sincronizarDisenoInstitucional(quill);
		}, delay);
	}

	// Qué hace: obtiene la instancia viva de Quill administrada por DxHtmlEditor y reenlaza eventos si fue recreada.
	// Cómo lo hace: consulta getQuillInstance o propiedades internas del componente y actualiza listeners cuando detecta nueva instancia o nodo raíz.
	private obtenerQuillActivo(): any {
		const quillActual =
			this.editorInstance?.getQuillInstance?.() ||
			this.editorInstance?._quillInstance ||
			this.editorInstance?.getQuill?.() ||
			this.quillInstance;

		if (
			quillActual &&
			(quillActual !== this.boundQuillInstance || quillActual.root !== this.boundQuillRoot)
		) {
			this.enlazarEventosQuill(quillActual);
		}

		return quillActual;
	}

	// Qué hace: remueve los escuchadores DOM y eventos de Quill de la instancia enlazada actualmente.
	// Cómo lo hace: retira listeners de captura y burbuja con las mismas referencias y desvincula eventos de Quill.
	private desenlazarEventosQuill(): void {
		if (this.boundQuillRoot) {
			this.boundQuillRoot.removeEventListener('dragover', this.dragOverHandler, true);
			this.boundQuillRoot.removeEventListener('drop', this.dropHandler, true);
			this.boundQuillRoot.removeEventListener('mousedown', this.mouseDownHandler);
			this.boundQuillRoot.removeEventListener('paste', this.pasteHandler, true);
		}
		if (this.boundQuillInstance?.off) {
			this.boundQuillInstance.off('text-change', this.textChangeHandler);
			this.boundQuillInstance.off('selection-change', this.selectionChangeHandler);
		}
		this.boundQuillRoot = null;
		this.boundQuillInstance = null;
	}

	// Qué hace: vincula los eventos de edición, arrastre, pegado y redistribución de tablas sobre la instancia viva de Quill.
	// Cómo lo hace: libera cualquier vínculo anterior, registra eventos en fase de captura y parchea el módulo de tablas sin duplicarlo.
	private enlazarEventosQuill(quill: any): void {
		if (!quill) return;

		this.desenlazarEventosQuill();
		this.quillInstance = quill;
		this.boundQuillInstance = quill;
		this.boundQuillRoot = quill.root || null;

		quill.on?.('text-change', this.textChangeHandler);
		quill.on?.('selection-change', this.selectionChangeHandler);

		if (this.boundQuillRoot) {
			this.boundQuillRoot.addEventListener('dragover', this.dragOverHandler, true);
			this.boundQuillRoot.addEventListener('drop', this.dropHandler, true);
			this.boundQuillRoot.addEventListener('mousedown', this.mouseDownHandler);
			this.boundQuillRoot.addEventListener('paste', this.pasteHandler, true);
		}

		this.parchearModuloTablas(quill);
	}

	// Qué hace: intercepta las operaciones de tabla en Quill para redistribuir anchos de columnas equitativamente.
	// Cómo lo hace: envuelve insertTable, insertColumn y deleteColumn garantizando con una marca interna que solo se aplique una vez.
	private parchearModuloTablas(quill: any): void {
		const tableModule = quill?.getModule?.('table');
		if (!tableModule || tableModule._sgueesTablePatched) return;
		tableModule._sgueesTablePatched = true;

		if (typeof tableModule.insertTable === 'function') {
			const originalInsertTable = tableModule.insertTable.bind(tableModule);
			tableModule.insertTable = (rows: number, columns: number) => {
				if (!quill.getSelection()) {
					quill.setSelection(Math.max(0, quill.getLength() - 1), 0, 'silent');
				}
				const result = originalInsertTable(rows, columns);
				setTimeout(() => this.redistribuirColumnasTabla(quill, tableModule), 20);
				return result;
			};
		}

		if (typeof tableModule.insertColumn === 'function') {
			const originalInsertColumn = tableModule.insertColumn.bind(tableModule);
			tableModule.insertColumn = (offset: number) => {
				const result = originalInsertColumn(offset);
				setTimeout(() => this.redistribuirColumnasTabla(quill, tableModule), 20);
				return result;
			};
		}

		if (typeof tableModule.deleteColumn === 'function') {
			const originalDeleteColumn = tableModule.deleteColumn.bind(tableModule);
			tableModule.deleteColumn = () => {
				const result = originalDeleteColumn();
				setTimeout(() => this.redistribuirColumnasTabla(quill, tableModule), 20);
				return result;
			};
		}
	}

	// Qué hace: intercepta el diálogo nativo de añadir enlace para inyectar selector de parámetros URL cuando existan en el módulo.
	// Cómo lo hace: envuelve showFormDialog una sola vez mediante la guarda linkDialogPatched para evitar múltiples envoltorios al rerenderizar.
	private parchearDialogoEnlace(editorInstance: any): void {
		if (!editorInstance || this.linkDialogPatched || typeof editorInstance.showFormDialog !== 'function') {
			return;
		}
		this.linkDialogPatched = true;
		const originalShowFormDialog = editorInstance.showFormDialog.bind(editorInstance);
		editorInstance.showFormDialog = (formConfig: any) => {
			const esDialogoEnlace = formConfig?.formData && Object.prototype.hasOwnProperty.call(formConfig.formData, 'href');
			if (esDialogoEnlace) {
				const parametrosUrl = this.obtenerParametrosUrl();
				if (parametrosUrl.length > 0) {
					// Si el enlace actual ya coincide con {{CLAVE}}, preseleccionarlo en el selector
					const matchActual = typeof formConfig.formData.href === 'string'
						? formConfig.formData.href.match(/^\{\{([A-Za-z0-9_]+)\}\}$/)
						: null;
					formConfig.formData.parametroUrl = matchActual ? matchActual[1] : null;

					const itemParametroUrl = {
						dataField: 'parametroUrl',
						label: { text: 'Parámetro URL' },
						editorType: 'dxSelectBox',
						editorOptions: {
							items: parametrosUrl,
							displayExpr: 'label',
							valueExpr: 'key',
							placeholder: 'Seleccione un parámetro de enlace...',
							showClearButton: true,
							value: formConfig.formData.parametroUrl,
							onValueChanged: (args: any) => {
								if (args.value) {
									editorInstance._formDialog?._form?.updateData('href', `{{${args.value}}}`);
									const currentText = editorInstance._formDialog?._form?.option('formData')?.text;
									if (!currentText || currentText.trim() === '') {
										const param = parametrosUrl.find((p) => p.key === args.value);
										if (param?.label) {
											editorInstance._formDialog?._form?.updateData('text', param.label);
										}
									}
								}
							}
						}
					};

					// Insertar el selector de parámetro URL justo antes del campo URL
					const itemsExistentes = formConfig.items || [];
					const indexHref = itemsExistentes.findIndex((it: any) => it.dataField === 'href');
					if (indexHref >= 0) {
						formConfig.items = [
							...itemsExistentes.slice(0, indexHref),
							itemParametroUrl,
							...itemsExistentes.slice(indexHref)
						];
					} else {
						formConfig.items = [itemParametroUrl, ...itemsExistentes];
					}
				}
			}
			return originalShowFormDialog(formConfig);
		};
	}

	// Qué hace: intercepta la inicialización del editor para enlazar la instancia real de Quill y el selector de parámetros URL.
	// Cómo lo hace: almacena la referencia de DxHtmlEditor, enlaza eventos sobre la instancia viva de Quill y sincroniza el diseño institucional.
	onEditorInitialized(e: any): void {
		this.editorInstance = e?.component ?? null;
		this.parchearDialogoEnlace(this.editorInstance);
		const quill = this.obtenerQuillActivo();
		if (quill) {
			setTimeout(() => this.sincronizarDisenoInstitucional(quill), 80);
			if (this.esValorPlantillaInstitucional(this.value)) {
				setTimeout(() => this.posicionarEnTarjetaCentral(false), 150);
			}
		}
	}

	// Qué hace: mantiene sincronizada la instancia viva de Quill tras invalidaciones o rerenderizados internos de DxHtmlEditor.
	// Cómo lo hace: reenlaza listeners en cada onContentReady si Quill cambió y reprograma la sincronización institucional si corresponde.
	onEditorContentReady(e: any): void {
		if (e?.component) {
			this.editorInstance = e.component;
		}
		this.parchearDialogoEnlace(this.editorInstance);
		const quill = this.obtenerQuillActivo();
		if (quill && this.esValorPlantillaInstitucional(this.value)) {
			this.programarSincronizacionDiseno(quill, 40);
		}
	}

	// Qué hace: extrae y filtra únicamente los parámetros disponibles clasificados o nombrados como enlaces web / URLs.
	// Cómo lo hace: evalúa si el parámetro tiene tipo 'URL' o si su clave o etiqueta contiene palabras clave como ENLACE, URL, LINK, PORTAL o SITIO.
	obtenerParametrosUrl(): Array<{ key: string; label: string; descripcion?: string; tipo?: string }> {
		if (!this.parametros || !Array.isArray(this.parametros) || this.parametros.length === 0) {
			return [];
		}

		return this.parametros.filter((p) => {
			if (!p || !p.key) return false;
			if (p.tipo && p.tipo.toUpperCase() === 'URL') {
				return true;
			}
			const keyUpper = p.key.toUpperCase();
			const labelUpper = (p.label || '').toUpperCase();
			return (
				keyUpper.includes('ENLACE') ||
				keyUpper.includes('URL') ||
				keyUpper.includes('LINK') ||
				keyUpper.includes('PORTAL') ||
				keyUpper.includes('SITIO') ||
				labelUpper.includes('ENLACE') ||
				labelUpper.includes('URL') ||
				labelUpper.includes('LINK') ||
				labelUpper.includes('PORTAL') ||
				labelUpper.includes('SITIO WEB')
			);
		});
	}

	// Qué hace: redistribuye equitativamente el ancho entre todas las columnas de la tabla activa.
	// Cómo lo hace: calcula el ancho disponible del contenedor, divide entre el número total de columnas y actualiza el formato cellWidth de Quill y el estilo de cada celda, sincronizando los marcos de redimensionamiento de DevExtreme.
	private redistribuirColumnasTabla(quill: any, tableModule: any): void {
		try {
			if (!quill) {
				return;
			}
			const selection = quill.getSelection();
			let tableEl: HTMLTableElement | null = null;
			if (selection && tableModule && typeof tableModule.getTable === 'function') {
				const tableInfo = tableModule.getTable(selection);
				if (tableInfo?.[0]?.domNode) {
					tableEl = tableInfo[0].domNode;
				}
			}

			if (!tableEl) {
				const tables = quill.root?.querySelectorAll('table');
				if (tables && tables.length > 0) {
					tableEl = tables[tables.length - 1] as HTMLTableElement;
				}
			}

			if (!tableEl) {
				return;
			}

			const rows = tableEl.querySelectorAll('tr');
			if (rows.length === 0) {
				return;
			}

			const firstRowCells = rows[0].querySelectorAll('th, td');
			const colCount = firstRowCells.length;
			if (colCount <= 0) {
				return;
			}

			const containerWidth = quill.root?.clientWidth || tableEl.parentElement?.clientWidth || 700;
			const tableWidth = Math.max(300, containerWidth - 36);
			const equalColWidth = Math.max(50, Math.floor(tableWidth / colCount));

			rows.forEach((row) => {
				const cells = row.querySelectorAll('th, td');
				cells.forEach((cell) => {
					const cellEl = cell as HTMLElement;
					cellEl.style.width = `${equalColWidth}px`;
					const cellBlot = quill.scroll?.find(cell);
					if (cellBlot && typeof cellBlot.format === 'function') {
						cellBlot.format('cellWidth', `${equalColWidth}px`);
					}
				});
			});

			const tableResizing = quill.getModule('modules/tableResizing');
			if (tableResizing) {
				if (typeof tableResizing._applyResizingImpl === 'function') {
					tableResizing._applyResizingImpl();
				} else if (typeof tableResizing._updateFramesPositions === 'function') {
					tableResizing._updateFramesPositions();
					tableResizing._updateFramesSeparators();
				}
			}

			quill.update('user');
		} catch (err) {
			console.warn('Error al redistribuir columnas de tabla en editor:', err);
		}
	}

	// Qué hace: determina el rol institucional (encabezado, cuerpo o pie) de una tabla.
	// Cómo lo hace: evalúa la posición estructural dentro de la plantilla institucional dando prioridad al orden (primera = encabezado, última = pie con texto de contacto, e intermedias = cuerpo gris) evitando falsos positivos por estilos heredados.
	private resolverTipoTablaInstitucional(
		tbl: HTMLTableElement,
		index: number,
		institucionales: HTMLTableElement[]
	): 'encabezado' | 'cuerpo' | 'pie' {
		const pos = institucionales.indexOf(tbl) >= 0 ? institucionales.indexOf(tbl) : index;
		const total = institucionales.length;

		// 1. Si es la primera tabla de la secuencia o contiene imagen de logo, siempre es encabezado
		if (pos === 0 || tbl.querySelector('img')) {
			return 'encabezado';
		}

		// 2. Si hay 3 o más tablas y estamos en una posición intermedia, es obligatoriamente cuerpo
		if (total >= 3 && pos > 0 && pos < total - 1) {
			return 'cuerpo';
		}

		// 3. Evaluar si contiene datos institucionales de pie (contacto / derechos reservados)
		const text = (tbl.innerText || tbl.textContent || '').toLowerCase();
		const esContenidoPie =
			text.includes('universidad evang') ||
			text.includes('uees.edu.sv') ||
			text.includes('2275-4000') ||
			text.includes('prolongación alameda') ||
			text.includes('prolongacion alameda') ||
			tbl.classList.contains('plantilla-uees-pie');

		// 4. Si es la última tabla de la secuencia institucional
		if (pos === total - 1) {
			if (total >= 2) {
				return 'pie';
			}
			return esContenidoPie ? 'pie' : 'cuerpo';
		}

		if (esContenidoPie) {
			return 'pie';
		}

		return 'cuerpo';
	}

	// Qué hace: reaplica el color de fondo, padding y alineaciones en todas las celdas del formato institucional idéntico a CRoutines.
	// Cómo lo hace: para el encabezado aplica el azul #063b79, borde dorado #ffcc00 de 6px, celda izquierda de logo (145px, padding holgado) y celda derecha de título (535px, border-left blanco 2px); para el cuerpo fondo blanco #ffffff continuo a 680px; para el pie azul #063b79 con borde superior dorado de 5px a 680px.
	private aplicarEstiloCeldasInstitucionales(tbl: HTMLTableElement, tipo: 'encabezado' | 'cuerpo' | 'pie'): void {
		const celdas = Array.from(tbl.querySelectorAll('td, th')) as HTMLElement[];

		if (tipo === 'encabezado') {
			tbl.style.width = '680px';
			tbl.style.maxWidth = '680px';
			tbl.style.margin = '0 auto';
			tbl.style.backgroundColor = '#063b79';
			tbl.style.border = 'none';
			tbl.style.borderBottom = '6px solid #ffcc00';

			// Celda 1: Logotipo institucional con ancho suficiente de 145px para que la imagen de 100x81 no se recorte
			const celdaLogo = celdas[0];
			if (celdaLogo) {
				celdaLogo.style.width = '145px';
				celdaLogo.style.minWidth = '145px';
				celdaLogo.style.maxWidth = '145px';
				celdaLogo.style.backgroundColor = '#063b79';
				celdaLogo.style.border = 'none';
				celdaLogo.style.padding = '20px 10px 20px 25px';
				celdaLogo.style.textAlign = 'center';
				celdaLogo.style.verticalAlign = 'middle';
				celdaLogo.querySelectorAll('.ql-table-cell-line, p').forEach((cl) => {
					(cl as HTMLElement).dataset['cellbackgroundcolor'] = '#063b79';
				});
			}

			// Celda 2: Título institucional con línea vertical divisoria blanca de 2px
			const celdaTitulo = celdas.length > 1 ? celdas[1] : null;
			if (celdaTitulo) {
				celdaTitulo.style.width = '535px';
				celdaTitulo.style.backgroundColor = '#063b79';
				celdaTitulo.style.border = 'none';
				const contenedorTitulo = celdaTitulo.querySelector('div') as HTMLElement;
				if (contenedorTitulo) {
					celdaTitulo.style.borderLeft = 'none';
					celdaTitulo.style.padding = '20px 25px 20px 0';
					contenedorTitulo.style.borderLeft = '2px solid #ffffff';
					contenedorTitulo.style.paddingLeft = '20px';
				} else {
					celdaTitulo.style.borderLeft = '2px solid #ffffff';
					celdaTitulo.style.padding = '25px 30px 25px 20px';
				}
				celdaTitulo.style.textAlign = 'left';
				celdaTitulo.style.verticalAlign = 'middle';
				celdaTitulo.querySelectorAll('.ql-table-cell-line, p').forEach((cl) => {
					const el = cl as HTMLElement;
					el.dataset['cellbackgroundcolor'] = '#063b79';
					el.style.textAlign = 'left';
					el.style.color = '#ffffff';
				});
			}
			return;
		}

		if (tipo === 'pie') {
			tbl.style.width = '680px';
			tbl.style.maxWidth = '680px';
			tbl.style.margin = '0 auto';
			tbl.style.backgroundColor = '#063b79';
			tbl.style.border = 'none';
			tbl.style.borderTop = '5px solid #ffcc00';

			celdas.forEach((td) => {
				td.style.width = '680px';
				td.style.backgroundColor = '#063b79';
				td.style.border = 'none';
				td.style.color = '#ffffff';
				td.style.textAlign = 'center';
				td.style.padding = '25px 30px';
				td.querySelectorAll('.ql-table-cell-line, p').forEach((cl) => {
					const el = cl as HTMLElement;
					el.dataset['cellbackgroundcolor'] = '#063b79';
					if (!el.querySelector('a')) {
						el.style.color = '#ffffff';
					}
				});
			});
			return;
		}

		// Tarjeta central de cuerpo blanco continuo
		tbl.style.width = '680px';
		tbl.style.maxWidth = '680px';
		tbl.style.margin = '0 auto';
		tbl.style.backgroundColor = '#ffffff';
		tbl.style.border = 'none';

		celdas.forEach((td) => {
			td.style.width = '680px';
			td.style.backgroundColor = '#ffffff';
			td.style.border = 'none';
			td.style.color = '#102d59';
			td.style.padding = '35px 30px';
			td.style.textAlign = 'left';
			td.querySelectorAll('.ql-table-cell-line, p').forEach((cl) => {
				(cl as HTMLElement).dataset['cellbackgroundcolor'] = '#ffffff';
			});
		});
	}

	// Qué hace: preserva la identidad visual, colores de fondo y ausencia de bordes en las tablas del formato institucional de la UEES ante operaciones de edición y pegado de texto.
	// Cómo lo hace: identifica las tablas institucionales, restaura clase data-tipo y relleno en todas las celdas, y si un ciclo quedó pendiente lo vuelve a ejecutar al liberar la guarda.
	private sincronizarDisenoInstitucional(quill: any): void {
		if (this.isSyncingDiseno) {
			this.pendingSyncDiseno = true;
			return;
		}
		this.isSyncingDiseno = true;
		try {
			if (!quill || !quill.root) return;
			const tables = Array.from(quill.root.querySelectorAll('table')) as HTMLTableElement[];
			if (tables.length === 0) return;

			const esInstitucional = this.esPlantillaInstitucional(quill);
			this.esPlantillaActiva = esInstitucional;
			quill.root?.classList?.toggle('plantilla-uees-activa', esInstitucional);
			const contentContainer = quill.root?.closest('.dx-htmleditor-content');
			contentContainer?.classList?.toggle('plantilla-uees-activa', esInstitucional);

			// Qué hace: si la plantilla ya posee la estructura unificada oficial de CRoutines, respeta su maquetación interna intacta.
			// Cómo lo hace: verifica la presencia de td.header o td.content, confina el ancho del contenedor principal a 680px centrado y evita mutar tablas internas del logo o pie.
			const esEstructuraCRoutines = !!quill.root.querySelector('td.header, td.content, table.container');
			if (esEstructuraCRoutines) {
				const contenedor = (quill.root.querySelector('table.container') || tables[0]) as HTMLTableElement;
				if (contenedor) {
					contenedor.style.width = '680px';
					contenedor.style.maxWidth = '680px';
					contenedor.style.margin = '0 auto';
					contenedor.style.borderCollapse = 'collapse';
					contenedor.style.backgroundColor = '#ffffff';
				}
				return;
			}

			const institucionales = esInstitucional ? tables : tables.filter((tbl) => this.esTablaInstitucional(tbl));
			if (institucionales.length === 0) return;

			institucionales.forEach((tbl, index) => {
				const tipo = this.resolverTipoTablaInstitucional(tbl, index, institucionales);
				tbl.classList.add('plantilla-uees-table');
				tbl.setAttribute('data-tipo', tipo);
				tbl.setAttribute('align', 'center');
				tbl.setAttribute('width', '680');
				tbl.style.border = 'none';
				tbl.style.borderCollapse = 'collapse';
				tbl.style.borderSpacing = '0';
				tbl.style.maxWidth = '680px';
				tbl.style.width = '680px';
				tbl.style.margin = '0 auto';
				if (tipo === 'pie') {
					tbl.classList.add('plantilla-uees-pie');
				} else {
					tbl.classList.remove('plantilla-uees-pie');
				}

				this.aplicarEstiloCeldasInstitucionales(tbl, tipo);
			});

			// Ocultar cualquier párrafo separador entre tablas para que la tarjeta sea 100% continua
			const separatorParagraphs = Array.from(quill.root.querySelectorAll('table + p, p.plantilla-spacer')) as HTMLElement[];
			separatorParagraphs.forEach((p) => {
				p.style.display = 'none';
				p.style.margin = '0';
				p.style.padding = '0';
				p.style.height = '0';
				p.style.minHeight = '0';
				p.style.maxHeight = '0';
				p.style.lineHeight = '0';
				p.style.fontSize = '0';
				p.style.border = 'none';
			});
		} catch (err) {
			console.warn('Error al sincronizar diseño institucional en editor:', err);
		} finally {
			setTimeout(() => {
				this.isSyncingDiseno = false;
				if (this.pendingSyncDiseno) {
					this.pendingSyncDiseno = false;
					this.sincronizarDisenoInstitucional(quill);
				}
			}, 80);
		}
	}
}

@NgModule({
	imports: [CommonModule, DxHtmlEditorModule, DxDropDownButtonModule, DxPopoverModule],
	declarations: [TextEditorComponent],
	exports: [TextEditorComponent],
})
export class TextEditorModule {}
