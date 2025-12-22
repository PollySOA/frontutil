import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalinescuService } from '../../../service/calinescu.service';
import { ICalinescu } from '../../../model/calinescu';
import { HttpErrorResponse } from '@angular/common/http';
import { debug } from '../../../environment/environment';
import { MatDialog } from '@angular/material/dialog';
import { CanComponentDeactivate } from '../../../guards/pending-changes.guard';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

/**
 * Componente para crear un nuevo item en la lista de compra (vista admin).
 * 
 * Proporciona un formulario reactivo con validaciones para crear nuevos items.
 * Incluye:
 * - Validaciones en tiempo real con mensajes de error
 * - Conversión de formatos de fecha para el backend
 * - Guard para prevenir pérdida de datos sin guardar
 * - Redirección automática tras creación exitosa
 */
@Component({
  selector: 'app-routed-admin-new-calinescu',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './routed-admin-new.html',
  styleUrl: './routed-admin-new.css',
})
export class RoutedAdminNewCalinescu implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private calinescuService = inject(CalinescuService);
  private dialog = inject(MatDialog);

  /** Formulario reactivo para crear el item */
  calinescuForm!: FormGroup;
  
  /** Mensaje de error si falla la creación */
  error: string | null = null;
  
  /** Indica si se está enviando el formulario */
  submitting: boolean = false;

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Inicializa el formulario reactivo con los campos y validaciones necesarias.
   */
  inicializarFormulario(): void {
    this.calinescuForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255)
      ]],
      contenido: ['', [
        Validators.required,
        Validators.minLength(3),
      ]],
      fechaCompraEsperada: [''],
      publicado: [true],
      precio: [0, [Validators.min(0)]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
    });
  }

  /**
   * Procesa y envía el formulario para crear un nuevo item.
   * Valida el formulario, convierte las fechas al formato del backend
   * y redirige al listado tras la creación exitosa.
   */
  enviarFormulario(): void {
    if (!this.calinescuForm.valid) {
      this.calinescuForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    
    // Convertir fecha si existe
    let fechaFormateada: string | undefined = undefined;
    if (this.calinescuForm.value.fechaCompraEsperada) {
      const fecha = new Date(this.calinescuForm.value.fechaCompraEsperada);
      fechaFormateada = this.formatearFecha(fecha);
    }
    
    const payload: Partial<ICalinescu> = {
      nombre: this.calinescuForm.value.nombre,
      contenido: this.calinescuForm.value.contenido,
      fecha_compra_esperada: fechaFormateada,
      publicado: this.calinescuForm.value.publicado,
      precio: this.calinescuForm.value.precio || 0,
      cantidad: this.calinescuForm.value.cantidad || 1,
    };

    this.calinescuService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.calinescuForm.markAsPristine(); // Marcar como pristine para evitar el guard
        this.router.navigate(['/calinescu/plist']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = 'Error al crear el item';
        if (debug) console.error(err);
      },
    });
  }

  /**
   * Formatea un objeto Date al formato esperado por el backend.
   * 
   * @param fecha - Objeto Date a formatear
   * @returns Fecha en formato "yyyy-MM-dd HH:mm:ss"
   */
  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /** Getter para acceder al control 'nombre' del formulario */
  get nombre() {
    return this.calinescuForm.get('nombre');
  }

  /** Getter para acceder al control 'contenido' del formulario */
  get contenido() {
    return this.calinescuForm.get('contenido');
  }

  /** Getter para acceder al control 'fechaCompraEsperada' del formulario */
  get fechaCompraEsperada() {
    return this.calinescuForm.get('fechaCompraEsperada');
  }

  /** Getter para acceder al control 'publicado' del formulario */
  get publicado() {
    return this.calinescuForm.get('publicado');
  }

  /** Getter para acceder al control 'precio' del formulario */
  get precio() {
    return this.calinescuForm.get('precio');
  }

  /** Getter para acceder al control 'cantidad' del formulario */
  get cantidad() {
    return this.calinescuForm.get('cantidad');
  }

  /**
   * Implementación de CanComponentDeactivate.
   * Previene la navegación si hay cambios sin guardar en el formulario.
   * 
   * @returns true si puede navegar, false o un observable según la decisión del usuario
   */
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.calinescuForm && this.calinescuForm.dirty && !this.submitting) {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Cambios sin guardar',
          message: '¿Estas seguro de que deseas salir sin guardar los cambios?'
        }
      });
      return ref.afterClosed();
    }
    return true;
  }
}
