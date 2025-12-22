import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SilvestreService } from '../../../service/silvestre';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ISilvestre } from '../../../model/silvestre';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-routed-admin-edit',
    imports: [ReactiveFormsModule, RouterLink, MatSnackBarModule],
    templateUrl: './routed-admin-edit.html',
    styleUrl: './routed-admin-edit.css',
})
export class RoutedAdminEdit implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private silvestreService = inject(SilvestreService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    silvestreForm!: FormGroup;
    silvestreId: number | null = null;
    loading: boolean = true;
    error: string | null = null;
    submitting: boolean = false;
    private originalSilvestre: ISilvestre | null = null;

    ngOnInit(): void {
        this.initForm();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.silvestreId = +id;
            this.loadSilvestre(+id);
        } else {
            this.loading = false;
            this.error = 'ID de post no válido';
        }
    }

    initForm(): void {
        this.silvestreForm = this.fb.group({
            titulo: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(200)]],
            descripcion: ['', [
                Validators.required,
                Validators.minLength(10)]],
            urlImagen: ['', [Validators.maxLength(100)]],
            publicado: [false],
        });
    }

    loadSilvestre(id: number): void {
        this.silvestreService.get(id).subscribe({
            next: (silvestre: ISilvestre) => {
                this.originalSilvestre = silvestre;
                this.silvestreForm.patchValue({
                    titulo: silvestre.titulo,
                    descripcion: silvestre.descripcion,
                    urlImagen: silvestre.urlImagen,
                    publicado: silvestre.publicado,
                });
                this.loading = false;
            },
            error: (err: HttpErrorResponse) => {
                this.error = 'Error al cargar el post';
                this.loading = false;
                console.error(err);
            },
        });
    }

    onSubmit(): void {
        if (!this.silvestreForm.valid || !this.silvestreId) {
            this.silvestreForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const payload: Partial<ISilvestre> = {
            id: this.silvestreId!,
            titulo: this.silvestreForm.value.titulo,
            descripcion: this.silvestreForm.value.descripcion,
            urlImagen: this.silvestreForm.value.urlImagen
            ,
            publicado: this.silvestreForm.value.publicado
        };

        this.silvestreService.update(payload).subscribe({
                next: () => {
                    this.submitting = false;
                    // marcar formulario como limpio para evitar prompt del guard
                    if (this.silvestreForm) {
                        this.silvestreForm.markAsPristine();
                    }
                    this.router.navigate(['/silvestre/plist']);
                    this.snackBar.open('Publicación actualizada', 'Cerrar', { duration: 3000 });
                },
                error: (err: HttpErrorResponse) => {
                    this.submitting = false;
                    this.error = 'Error al guardar el post';
                    console.error(err);
                    this.snackBar.open('Error al guardar la publicación', 'Cerrar', { duration: 4000 });
                },
            });
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

    // Guard: ask confirmation if the form has unsaved changes
    canDeactivate(): boolean | Promise<boolean> | import("rxjs").Observable<boolean> {
        if (!this.silvestreForm || !this.silvestreForm.dirty) {
            return true;
        }
        const ref = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Cambios sin guardar',
                message: 'Hay cambios sin guardar. ¿Desea salir sin guardar los cambios?'
            }
        });
        return ref.afterClosed();
    }
}
