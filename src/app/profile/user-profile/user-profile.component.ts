import { ChangeDetectionStrategy, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {merge} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { ValidationService } from '../../shared/services/validation.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  userName: string = 'John Doe';
  email = new FormControl('john.doe@example.com', [Validators.required, Validators.email]);
  phoneNumber = new FormControl('+40 712 345 678', [Validators.required]);
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

  constructor(private validationService: ValidationService) {
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

  updateEmailError() {
    if (this.email.hasError('required')) {
      this.emailError.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.emailError.set('Not a valid email');
    } else {
      this.emailError.set('');
    }
  }
  
  toggleEdit() {
    if (this.isEditing) {
      if (this.validatePhoneNumber()) {
        this.isEditing = false;
      }
    } else {
      this.editEmail = this.email.value || '';
      this.phoneNumberError.set('');
      this.isEditing = true;
    }
  }
  
  onPhoneNumberKeyPress(event: KeyboardEvent): boolean {
    const allowedChars = /[0-9\+\s\-\(\)]/;
    const inputChar = event.key;
    
    if (inputChar.length === 1 && !allowedChars.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
  
  validatePhoneNumber(): boolean {
    const phoneNumber = this.phoneNumber.value || '';
    
    if (!this.validationService.validatePhoneNumber(phoneNumber)) {
      this.phoneNumberError.set(this.validationService.getPhoneNumberErrorMessage(phoneNumber));
      this.phoneNumber.setErrors({ 'invalidFormat': true });
      return false;
    }
    
    this.phoneNumberError.set('');
    this.phoneNumber.setErrors(null);
    return true;
  }
  
  validateLicensePlate(): boolean {
    const licensePlate = this.newCarPlate.value || '';
    
    if (!licensePlate.trim()) {
      this.licensePlateError.set('');
      this.newCarPlate.setErrors(null);
      return true;
    }
    
    if (!this.validationService.validateRomanianLicensePlate(licensePlate)) {
      this.licensePlateError.set('Not a valid Romanian license plate');
      this.newCarPlate.setErrors({ 'invalidFormat': true });
      return false;
    }
    
    this.licensePlateError.set('');
    this.newCarPlate.setErrors(null);
    return true;
  }
  
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.type.match(/image\/*/) == null) {
        alert('Only images are supported');
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        this.profileImage = reader.result as string;
      };
    }
  }
  
  addCar() {
    if (this.newCarPlate.value && this.newCarPlate.valid) {
      if (this.validateLicensePlate()) {
        const newId = Math.max(0, ...this.cars.map(car => car.id)) + 1;
        this.cars.push({
          id: newId,
          plate: this.newCarPlate.value,
          type: 'Unknown',
          color: 'Unknown'
        });
        this.newCarPlate.setValue('');
      }
    }
  }
  
  removeCar(id: number) {
    this.cars = this.cars.filter(car => car.id !== id);
  }
  
  onLicensePlateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    const upperCaseValue = input.value.toUpperCase();

    if (input.value !== upperCaseValue) {
      this.newCarPlate.setValue(upperCaseValue, {emitEvent: false});
      
      setTimeout(() => {
        input.setSelectionRange(start, end);
      }, 0);
    }
    
    this.validateLicensePlate();
  }
}
