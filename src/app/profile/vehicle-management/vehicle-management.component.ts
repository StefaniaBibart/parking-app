import { Component, inject, OnInit } from '@angular/core';

import { MaterialModule } from '../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../shared/services/data.service';
import { Vehicle } from '../../shared/models/vehicle.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.css'],
})
export class VehicleManagementComponent implements OnInit {
  vehicles: Vehicle[] = [];
  showAddVehicleForm = false;
  isEditing = false;
  editingVehicleId: number | null = null;
  vehicleForm: FormGroup;

  private readonly dataService = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  constructor() {
    this.vehicleForm = this.fb.group({
      plate: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    await this.loadVehicles();
  }

  async loadVehicles() {
    try {
      this.vehicles = await this.dataService.getUserVehicles();
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }

  editVehicle(vehicle: Vehicle) {
    this.isEditing = true;
    this.editingVehicleId = vehicle.id;
    this.vehicleForm.patchValue({
      plate: vehicle.plate,
    });
    this.showAddVehicleForm = true;
  }

  async deleteVehicle(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Vehicle',
        message: 'Are you sure you want to delete this vehicle?',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.dataService.deleteVehicle(id);
          await this.loadVehicles();
        } catch (error) {
          console.error('Error deleting vehicle:', error);
        }
      }
    });
  }

  async saveVehicle() {
    if (this.vehicleForm.invalid) return;

    try {
      const vehicleData = this.vehicleForm.value;

      if (this.isEditing && this.editingVehicleId) {
        const updatedVehicle: Vehicle = {
          id: this.editingVehicleId,
          plate: vehicleData.plate,
        };

        await this.dataService.updateVehicle(updatedVehicle);
      } else {
        const newVehicle: Vehicle = {
          id: Date.now(),
          plate: vehicleData.plate,
        };

        await this.dataService.addVehicle(newVehicle);
      }

      this.resetForm();
      await this.loadVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  }

  cancelForm() {
    this.resetForm();
  }

  resetForm() {
    this.vehicleForm.reset();
    this.showAddVehicleForm = false;
    this.isEditing = false;
    this.editingVehicleId = null;
  }
}
