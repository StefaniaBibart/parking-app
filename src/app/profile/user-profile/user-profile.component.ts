import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  ViewChild,
  OnInit,
  viewChild,
} from '@angular/core';
import { MaterialModule } from '../../material.module';

import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ValidationService } from '../../shared/services/validation.service';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { User } from '../../shared/models/user.model';
import { Vehicle } from '../../shared/models/vehicle.model';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-profile',
  imports: [MaterialModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  fileInput = viewChild.required<ElementRef>('fileInput');

  username = new FormControl('', [Validators.required]);
  email = new FormControl({ value: '', disabled: true });
  phoneNumber = new FormControl('', [Validators.required]);
  profileImage: string = 'assets/avatar.png';

  isEditing: boolean = false;

  newCarPlate = new FormControl('');

  usernameError = signal('');
  phoneNumberError = signal('');
  licensePlateError = signal('');

  cars: Vehicle[] = [];

  constructor(
    private validationService: ValidationService,
    private authService: AuthService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog
  ) {
    merge(this.username.statusChanges, this.username.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateUsernameError());

    merge(this.phoneNumber.statusChanges, this.phoneNumber.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.validatePhoneNumber());

    merge(this.newCarPlate.statusChanges, this.newCarPlate.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.validateLicensePlate());
  }

  async ngOnInit() {
    try {
      const user = await this.authService.user();
      if (user) {
        this.loadUserData(user);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
    }
  }

  async loadUserData(user: User) {
    this.username.setValue(user.username);
    this.email.setValue(user.email);
    this.phoneNumber.setValue(user.phoneNumber || '');

    try {
      this.cars = await this.dataService.getUserVehicles();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }

  updateUsernameError() {
    if (this.username.hasError('required')) {
      this.usernameError.set('You must enter a username');
    } else {
      this.usernameError.set('');
    }
  }

  validatePhoneNumber(): boolean {
    const phoneValue = this.phoneNumber.value || '';
    if (!phoneValue) {
      this.phoneNumberError.set('Phone number is required');
      return false;
    }

    if (!this.validationService.validatePhoneNumber(phoneValue)) {
      this.phoneNumberError.set(
        this.validationService.getPhoneNumberErrorMessage(phoneValue)
      );
      return false;
    }

    this.phoneNumberError.set('');
    return true;
  }

  validateLicensePlate() {
    const plateValue = this.newCarPlate.value || '';
    if (
      plateValue &&
      !this.validationService.validateRomanianLicensePlate(plateValue)
    ) {
      this.licensePlateError.set('Invalid license plate format');
    } else {
      this.licensePlateError.set('');
    }
  }

  async toggleEdit() {
    if (this.isEditing) {
      return;
    } else {
      this.phoneNumberError.set('');
      this.usernameError.set('');
      this.isEditing = true;
    }
  }

  async confirmEdit() {
    if (this.validatePhoneNumber() && this.username.valid) {
      try {
        const currentUser = await this.authService.user();
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            username: this.username.value || currentUser.username,
            phoneNumber: this.phoneNumber.value || null,
          };

          await this.authService.updateUserProfile(updatedUser);

          this.isEditing = false;
          this.cdr.markForCheck();
        }
      } catch (error) {
        console.error('Error updating user profile:', error);
      }
    }
  }

  onPhoneNumberKeyPress(event: KeyboardEvent): boolean {
    return this.validationService.onPhoneNumberKeyPress(event);
  }

  triggerFileInput() {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async addCar() {
    const plateValue = this.newCarPlate.value || '';
    if (
      plateValue &&
      this.validationService.validateRomanianLicensePlate(plateValue)
    ) {
      try {
        const newVehicle = {
          id: Date.now(),
          plate: plateValue,
        };

        await this.dataService.addVehicle(newVehicle);

        this.cars = await this.dataService.getUserVehicles();
        this.newCarPlate.setValue('');
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error adding vehicle:', error);
      }
    } else {
      this.licensePlateError.set('Invalid license plate format');
    }
  }

  async removeCar(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Vehicle',
        message:
          'Are you sure you want to delete this vehicle? All reservations made with this vehicle will also be deleted.',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.dataService.deleteVehicle(id);
          this.cars = await this.dataService.getUserVehicles();
          this.cdr.markForCheck();
        } catch (error) {
          console.error('Error removing vehicle:', error);
        }
      }
    });
  }

  onLicensePlateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();

    if (value.length === 2 && !value.includes(' ')) {
      value += ' ';
    } else if (
      value.length === 5 &&
      value[2] === ' ' &&
      !value.includes(' ', 3)
    ) {
      value += ' ';
    }

    this.newCarPlate.setValue(value);
    this.validateLicensePlate();
  }

  logout() {
    this.authService.logout().subscribe({
      error: (err) => console.error('Logout failed', err),
    });
  }

  async cancelEdit() {
    const user = await this.authService.user();
    if (user) {
      this.username.setValue(user.username);
      this.phoneNumber.setValue(user.phoneNumber || '');
    }

    this.phoneNumberError.set('');
    this.usernameError.set('');

    this.isEditing = false;
  }
}
