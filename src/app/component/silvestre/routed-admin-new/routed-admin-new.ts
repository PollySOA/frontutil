import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SilvestreService } from '../../../service/silvestre';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ISilvestre } from '../../../model/silvestre';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-routed-admin-new',
  imports: [ReactiveFormsModule, RouterLink, MatSnackBarModule, MatDialogModule],
  templateUrl: './routed-admin-new.html',
  styleUrl: './routed-admin-new.css',
})
export class RoutedAdminNew implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private silvestreService = inject(SilvestreService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  silvestreForm!: FormGroup;
  error: string | null = null;
  submitting: boolean = false;

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.silvestreForm = this.fb.group({
  titulo: ['', [
    Validators.required, 
    Validators.minLength(3), 
    Validators.maxLength(1024)
  ]],
  descripcion: ['', [
    Validators.required, 
    Validators.minLength(3)
  ]],
  // backend requires min length 5 for urlImagen
  urlImagen: ['', [
    Validators.required, 
    Validators.minLength(5), 
    Validators.maxLength(2048)
  ]],
  publicado: [false]
    });
  }

  // Formato que acepta el back
  private toLocalDateTime(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());

    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`; // ← SIN MILISEGUNDOS
  }

  onSubmit(): void {
    if (!this.silvestreForm.valid) {
      this.silvestreForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = {
      titulo: this.silvestreForm.value.titulo!,
      descripcion: this.silvestreForm.value.descripcion!,
      urlImagen: this.silvestreForm.value.urlImagen!,
      publicado: this.silvestreForm.value.publicado,
    };
    // debug: ensure published value is correct before sending
    console.debug('Silvestre create payload', payload);

    this.silvestreService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        // mark form as pristine so canDeactivate guard won't ask confirmation
        if (this.silvestreForm) {
          this.silvestreForm.markAsPristine();
        }
        this.snackBar.open('Publicación creada', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/silvestre/plist']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = 'Error al crear la imagen';
        console.error(err);
  this.snackBar.open('Error al crear la publicación', 'Cerrar', { duration: 4000 });
      },
    });
  }

  // Guard: ask confirmation if the form has unsaved changes
  canDeactivate(): boolean | Promise<boolean> | import('rxjs').Observable<boolean> {
    if (!this.silvestreForm || !this.silvestreForm.dirty) {
      return true;
    }
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cambios sin guardar',
        message: 'Hay cambios sin guardar. \u00bfDesea salir sin guardar los cambios?',
      },
    });
    return ref.afterClosed();
  }

  get titulo() {
    return this.silvestreForm.get('titulo');
  }

  get descripcion() {
    return this.silvestreForm.get('descripcion');
  }

  get urlImagen() {
    return this.silvestreForm.get('urlImagen');
  }

    get publicado() {
    return this.silvestreForm.get('publicado');
  }
}
