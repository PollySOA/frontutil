import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SoaresService } from '../../../service/soares';
import { ISoares } from '../../../model/soares';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-soares-routed-admin-edit',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './routed-admin-edit.html',
    styleUrl: './routed-admin-edit.css',
})
export class SoaresRoutedAdminEdit implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private soaresService = inject(SoaresService);

    soaresForm!: FormGroup;
    soaresId: number | null = null;
    loading: boolean = true;
    error: string | null = null;
    submitting: boolean = false;
    private originalSoares: ISoares | null = null;

    ngOnInit(): void {
        this.initForm();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.soaresId = +id;
            this.loadSoares(+id);
        } else {
            this.loading = false;
            this.error = 'ID de pregunta no válido';
        }
    }

    initForm(): void {
        this.soaresForm = this.fb.group({
            preguntas: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(500)]],
        });
    }

    loadSoares(id: number): void {
        this.soaresService.getOne(id).subscribe({
            next: (soares: ISoares) => {
                this.originalSoares = soares;
                this.soaresForm.patchValue({
                    preguntas: soares.preguntas,
                });
                this.loading = false;
            },
            error: (err: HttpErrorResponse) => {
                this.error = 'Error al cargar la pregunta';
                this.loading = false;
                console.error(err);
            },
        });
    }

    onSubmit(): void {
        if (!this.soaresForm.valid || !this.soaresId) {
            this.soaresForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const payload: ISoares = {
            id: this.soaresId!,
            preguntas: this.soaresForm.value.preguntas,
            fechaCreacion: this.originalSoares!.fechaCreacion,
            fechaModificacion: this.originalSoares!.fechaModificacion,
            publicacion: this.originalSoares!.publicacion
        };

        this.soaresService.updateOne(payload).subscribe({
            next: () => {
                this.submitting = false;
                this.router.navigate(['/soares/admin/plist']);
            },
            error: (err: HttpErrorResponse) => {
                this.submitting = false;
                this.error = 'Error al guardar la pregunta';
                console.error(err);
            },
        });
    }

    get preguntas() {
        return this.soaresForm.get('preguntas');
    }
}
