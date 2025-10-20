import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { EventBusService, EventTypes, GlobalStateService } from 'shared';
import { AuthService } from '../../services/auth.service';
import { CrossrefMembersService, MemberOption } from '../../services/crossref-members.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  standalone: true,
  templateUrl: './login-form.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit, OnDestroy {

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly eventBus = inject(EventBusService);
  protected readonly globalState = inject(GlobalStateService);
  private readonly crossrefService = inject(CrossrefMembersService);
  private readonly router = inject(Router);
  
  loginForm: FormGroup;
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);
  
  memberOptions = signal<MemberOption[]>([]);
  showOptions = signal<boolean>(false);
  selectedMember = signal<MemberOption | null>(null);
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['1234', [Validators.required, Validators.minLength(4)]],
      memberId: [null],
    });
  }

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.crossrefService.searchMembers(query, 10))
    ).subscribe({
      next: (options) => {
        this.memberOptions.set(options);
        this.showOptions.set(options.length > 0);
      },
      error: (err) => {
        console.error('Error searching members:', err);
        this.memberOptions.set([]);
        this.showOptions.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  /**
   * Triggered on each input change in the username field.
   */
  onUsernameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (this.selectedMember()) {
      this.selectedMember.set(null);
      this.loginForm.patchValue({ memberId: null });
    }

    if (value) {
      this.searchSubject.next(value);
    } else {
      this.memberOptions.set([]);
      this.showOptions.set(false);
    }
  }

  /**
   * Handles selection from autocomplete options.
   */
  selectMember(member: MemberOption): void {
    this.selectedMember.set(member);
    this.loginForm.patchValue({
      username: member.displayName,
      memberId: member.id
    });
    this.showOptions.set(false);
    this.memberOptions.set([]);
  }

  /**
   * Closes options list on blur with a short delay to allow option click.
   */
  onInputBlur(): void {
    setTimeout(() => {
      this.showOptions.set(false);
    }, 200);
  }

  /**
   * Opens options list when input gains focus and there are options.
   */
  onInputFocus(): void {
    if (this.memberOptions().length > 0) {
      this.showOptions.set(true);
    }
  }

  onSubmit(): void {
    if(!this.loginForm.valid){
      this.errorMessage.set('Formulario inválido');
      return;
    }
    
    /** Ensure a member was selected from the options. */
    if (!this.loginForm.value.memberId) {
      this.errorMessage.set('Por favor selecciona un member de la lista de opciones');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: any = {
      memberId: this.loginForm.value.memberId,
      password: this.loginForm.value.password
    };
    
    this.authService.login(credentials)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.eventBus.emit(EventTypes.MEMBER_LOGGED_IN, response.member);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Error al iniciar sesión');
        }
      });
  }
}
