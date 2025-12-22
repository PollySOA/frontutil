import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { PavonService } from '../../../service/pavon/recurso';
import { IRecurso } from '../../../model/pavon/recurso';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-routed-admin-edit',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './routed-admin-edit.html',
    styleUrl: './routed-admin-edit.css',
})
export class RoutedAdminEditPavon implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private pavonService = inject(PavonService);

    recursoForm!: FormGroup;
    recursoId: number | null = null;
    loading: boolean = true;
    error: string | null = null;
    submitting: boolean = false;
    private originalRecurso: IRecurso | null = null;

    ngOnInit(): void {
        this.initForm();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.recursoId = +id;
            this.loadRecurso(+id);
        } else {
            this.loading = false;
            this.error = 'ID de recurso no válido';
        }
    }

    // Validador custom para URL absoluta
    private urlValidator(control: AbstractControl) {
        const value = control.value;
        if (!value) return null;
        try {
            new URL(value);
            return null;
        } catch {
            return { invalidUrl: true };
        }
    }

    initForm(): void {
        this.recursoForm = this.fb.group({
            nombre: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(200)]],
            url: ['', [
                Validators.required,
                Validators.minLength(10),
                this.urlValidator.bind(this)
            ]],
            publico: [false],
        });
    }

    loadRecurso(id: number): void {
        this.pavonService.get(id).subscribe({
            next: (recurso: IRecurso) => {
                this.originalRecurso = recurso;
                this.recursoForm.patchValue({
                    nombre: recurso.nombre,
                    url: recurso.url,
                    publico: recurso.publico,
                });
                this.loading = false;
            },
            error: (err: HttpErrorResponse) => {
                this.error = 'Error al cargar el recurso';
                this.loading = false;
                console.error(err);
            },
        });
    }

    onSubmit(): void {
        if (!this.recursoForm.valid || !this.recursoId) {
            this.recursoForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const formValue = this.recursoForm.getRawValue();
        
        // Construir payload - usar cualquier tipo para permitir diferentes formatos
        const payload: any = {
            id: this.recursoId!,
            nombre: formValue.nombre,
            url: formValue.url,
            publico: formValue.publico === true || formValue.publico === 'true' || formValue.publico === 1,
            fechaCreacion: this.originalRecurso?.fechaCreacion || '',
            fechaModificacion: this.originalRecurso?.fechaModificacion || null
        };

        console.log('Enviando payload:', JSON.stringify(payload));
        this.pavonService.update(payload).subscribe({
            next: () => {
                this.submitting = false;
                this.router.navigate(['/recurso/plist'], { queryParams: { msg: 'Recurso actualizado correctamente' } });
            },
            error: (err: HttpErrorResponse) => {
                this.submitting = false;
                this.error = 'Error al guardar el recurso';
                console.error(err);
            },
        });
    }

    get nombre() {
        return this.recursoForm.get('nombre');
    }

    get url() {
        return this.recursoForm.get('url');
    }

    get publico() {
        return this.recursoForm.get('publico');
    }
}
