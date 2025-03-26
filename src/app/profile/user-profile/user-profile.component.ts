import { Component, ElementRef, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  userName: string = 'John Doe';
  email: string = 'john.doe@example.com';
  phoneNumber: string = '+1 (555) 123-4567';
  profileImage: string = 'assets/avatar.png';
  
  isEditing: boolean = false;
  editEmail: string = '';
  editPhoneNumber: string = '';
  
  newCarPlate: string = '';
  
  cars = [
    { id: 1, plate: 'ABC-123', type: 'Sedan', color: 'Blue' },
    { id: 2, plate: 'XYZ-789', type: 'SUV', color: 'Black' }
  ];
  
  toggleEdit() {
    if (this.isEditing) {
      this.email = this.editEmail;
      this.phoneNumber = this.editPhoneNumber;
      this.isEditing = false;
    } else {
      this.editEmail = this.email;
      this.editPhoneNumber = this.phoneNumber;
      this.isEditing = true;
    }
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
    if (this.newCarPlate.trim()) {
      const newId = Math.max(0, ...this.cars.map(car => car.id)) + 1;
      this.cars.push({
        id: newId,
        plate: this.newCarPlate,
        type: 'Unknown',
        color: 'Unknown'
      });
      this.newCarPlate = '';
    }
  }
  
  removeCar(id: number) {
    this.cars = this.cars.filter(car => car.id !== id);
  }
}
