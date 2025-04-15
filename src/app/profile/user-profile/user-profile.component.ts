import { ChangeDetectionStrategy, Component, ElementRef, signal, ViewChild, OnInit } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ValidationService } from '../../shared/services/validation.service';
import { AuthService, User } from '../../shared/services/auth.service';

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
  
  cars = [
    { id: 1, plate: 'B 12 ABC', type: 'Sedan', color: 'Blue' },
    { id: 2, plate: 'CJ 34 XYZ', type: 'SUV', color: 'Black' }
  ];

  constructor(
    private validationService: ValidationService,
    private authService: AuthService
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

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loadUserData(currentUser);
    }
    
    this.authService.user.subscribe(user => {
      if (user) {
        this.loadUserData(user);
      }
    });
  }
  
  loadUserData(user: User) {
    this.userName = user.username;
    this.email.setValue(user.email);
    
    if (user.phoneNumber) {
      this.phoneNumber.setValue(user.phoneNumber);
    }
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.cars && Array.isArray(parsedData.cars)) {
        this.cars = parsedData.cars;
      }
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
  
  toggleEdit() {
    if (this.isEditing) {
      if (this.validatePhoneNumber()) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            email: this.email.value || currentUser.email,
            phoneNumber: this.phoneNumber.value || currentUser.phoneNumber,
          };
          
          // Save cars along with other user data
          const userData = {
            ...updatedUser,
            cars: this.cars
          };
          
          localStorage.setItem('userData', JSON.stringify(userData));
          this.authService['userSubject'].next(updatedUser);
        }
        
        this.isEditing = false;
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
  
  addCar() {
    const plateValue = this.newCarPlate.value || '';
    if (plateValue && this.validationService.validateRomanianLicensePlate(plateValue)) {
      const newCar = {
        id: this.cars.length + 1,
        plate: plateValue,
        type: 'Unknown',
        color: 'Unknown'
      };
      this.cars = [...this.cars, newCar];
      this.newCarPlate.setValue('');
    } else {
      this.licensePlateError.set('Invalid license plate format');
    }
  }
  
  removeCar(id: number) {
    this.cars = this.cars.filter(car => car.id !== id);
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
