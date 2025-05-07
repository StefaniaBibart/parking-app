import { ChangeDetectionStrategy, Component, ElementRef, signal, ViewChild, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ValidationService } from '../../shared/services/validation.service';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { User } from '../../shared/services/data.service';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

interface Car {
  id: number;
  plate: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  userName: string = '';
  email = new FormControl('', [Validators.required, Validators.email]);
  phoneNumber = new FormControl('', [Validators.required]);
  profileImage: string = 'assets/avatar.png';
  
  isEditing: boolean = false;
  editEmail: string = '';
  
  newCarPlate = new FormControl('');
  
  phoneNumberError = signal('');
  licensePlateError = signal('');
  emailError = signal('');
  
  cars: Car[] = [];

  constructor(
    private validationService: ValidationService,
    private authService: AuthService,
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateEmailError());
    
    merge(this.phoneNumber.statusChanges, this.phoneNumber.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.validatePhoneNumber());
    
    merge(this.newCarPlate.statusChanges, this.newCarPlate.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.validateLicensePlate());
  }

  async ngOnInit() {
    try {
      const user = this.authService.getCurrentUser();
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
    this.userName = user.username;
    this.email.setValue(user.email);
    
    if (user.phoneNumber) {
      this.phoneNumber.setValue(user.phoneNumber);
    }
    
    try {
      this.cars = await this.dataService.getUserVehicles();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }

  updateEmailError() {
    if (this.email.hasError('required')) {
      this.emailError.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.emailError.set('Not a valid email');
    } else {
      this.emailError.set('');
    }
  }
  
  validatePhoneNumber(): boolean {
    const phoneValue = this.phoneNumber.value || '';
    if (!phoneValue) {
      this.phoneNumberError.set('Phone number is required');
      return false;
    }
    
    if (!this.validationService.validatePhoneNumber(phoneValue)) {
      this.phoneNumberError.set(this.validationService.getPhoneNumberErrorMessage(phoneValue));
      return false;
    }
    
    this.phoneNumberError.set('');
    return true;
  }
  
  validateLicensePlate() {
    const plateValue = this.newCarPlate.value || '';
    if (plateValue && !this.validationService.validateRomanianLicensePlate(plateValue)) {
      this.licensePlateError.set('Invalid license plate format');
    } else {
      this.licensePlateError.set('');
    }
  }
  
  async toggleEdit() {
    if (this.isEditing) {
      if (this.validatePhoneNumber()) {
        try {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            const updatedUser: User = {
              ...currentUser,
              email: this.email.value || currentUser.email,
              phoneNumber: this.phoneNumber.value || currentUser.phoneNumber,
            };
            
            await this.authService.updateUserProfile(updatedUser);
            
          }
          
          this.isEditing = false;
        } catch (error) {
          console.error('Error updating user profile:', error);
        }
      }
    } else {
      this.editEmail = this.email.value || '';
      this.phoneNumberError.set('');
      this.isEditing = true;
    }
  }
  
  onPhoneNumberKeyPress(event: KeyboardEvent): boolean {
    return this.validationService.onPhoneNumberKeyPress(event);
  }
  
  triggerFileInput() {
    this.fileInput.nativeElement.click();
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
    if (plateValue && this.validationService.validateRomanianLicensePlate(plateValue)) {
      try {
        const newVehicle = {
          id: Date.now(),
          plate: plateValue
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
    try {
      await this.dataService.deleteVehicle(id);
      
      this.cars = await this.dataService.getUserVehicles();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error removing vehicle:', error);
    }
  }
  
  onLicensePlateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.toUpperCase();
    
    if (value.length === 2 && !value.includes(' ')) {
      value += ' ';
    } else if (value.length === 5 && value[2] === ' ' && !value.includes(' ', 3)) {
      value += ' ';
    }
    
    this.newCarPlate.setValue(value);
    this.validateLicensePlate();
  }

  logout() {
    this.authService.logout();
  }
}
