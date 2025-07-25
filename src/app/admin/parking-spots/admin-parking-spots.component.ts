import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { ConfigService } from '../../shared/services/config.service';
import { DataService } from '../../shared/services/data.service';
import { ParkingSpot } from '../../shared/models/parking-spot.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ParkingSpotService } from '../../shared/services/parking-spot.service';

@Component({
    selector: 'app-admin-parking-spots',
    imports: [CommonModule, MaterialModule],
    templateUrl: './admin-parking-spots.component.html',
    styleUrls: ['./admin-parking-spots.component.css']
})
export class AdminParkingSpotsComponent implements OnInit {
  parkingSpots: ParkingSpot[] = [];
  currentDate: Date = new Date();

  availableFloors: string[] = [];

  totalSpots = 0;
  spotsByFloor: { [key: string]: number } = {};

  currentFloorIndex = 0;
  visibleFloors: string[] = [];

  private readonly configService = inject(ConfigService);
  private readonly dataService = inject(DataService);
  private readonly parkingSpotService = inject(ParkingSpotService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit() {
    this.availableFloors = this.configService.parkingLayout.floors;
    this.loadParkingSpots();
    this.updateVisibleFloors();
  }

  async loadParkingSpots() {
    this.parkingSpots = await this.parkingSpotService.getParkingSpots();
    this.calculateStatistics();
  }

  calculateStatistics() {
    this.totalSpots = this.parkingSpots.length;
    this.spotsByFloor = {};

    this.availableFloors.forEach((floor: string) => {
      this.spotsByFloor[floor] = this.parkingSpots.filter(
        (spot) => spot.floor === floor
      ).length;
    });
  }

  getFloorSpots(floor: string): ParkingSpot[] {
    if (!floor) return [];
    return this.parkingSpots.filter((spot) => spot.floor === floor);
  }

  previousFloor() {
    if (this.currentFloorIndex > 0) {
      this.currentFloorIndex--;
      this.updateVisibleFloors();
    }
  }

  nextFloor() {
    if (this.currentFloorIndex < this.getMaxFloorIndex()) {
      this.currentFloorIndex++;
      this.updateVisibleFloors();
    }
  }

  updateVisibleFloors() {
    this.visibleFloors = [
      this.availableFloors[this.currentFloorIndex],
      this.availableFloors[this.currentFloorIndex + 1],
    ].filter(Boolean);
  }

  getMaxFloorIndex(): number {
    return this.availableFloors.length - 2;
  }

  async toggleBlockSpot(spot: ParkingSpot) {
    const newBlockedStatus = !spot.isBlocked;
    try {
      await this.parkingSpotService.updateParkingSpot(spot.id, {
        isBlocked: newBlockedStatus,
      });
      this.loadParkingSpots();
      this.snackBar.open(
        `Parking spot ${spot.id} has been ${
          newBlockedStatus ? 'blocked' : 'unblocked'
        }.`,
        'Close',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        }
      );
    } catch (error) {
      console.error('Error updating spot status:', error);
      this.snackBar.open(
        'Error updating parking spot status. Please try again.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
    }
  }

  async removeSpot(spot: ParkingSpot) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Remove Parking Spot',
        message: `Are you sure you want to remove parking spot ${spot.id}? This will also cancel any existing reservations for this spot.`,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
      },
    });

    const result = await dialogRef.afterClosed().toPromise();
    if (result) {
      try {
        const allReservations = await this.dataService.getAllReservations();
        const spotReservations = allReservations.filter(
          (res) => res.spot === spot.id
        );

        for (const reservation of spotReservations) {
          await this.dataService.deleteReservation(reservation.id);
        }

        await this.parkingSpotService.removeParkingSpot(spot.id);
        this.loadParkingSpots();

        const message =
          spotReservations.length > 0
            ? `Parking spot ${spot.id} removed successfully. ${spotReservations.length} reservation(s) were also cancelled.`
            : `Parking spot ${spot.id} removed successfully.`;

        this.snackBar.open(message, 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar'],
        });
      } catch (error) {
        console.error('Error removing spot and reservations:', error);
        this.snackBar.open(
          'Error removing parking spot. Please try again.',
          'Close',
          {
            duration: 3000,
            panelClass: ['error-snackbar'],
          }
        );
      }
    }
  }

  async addSpotToFloor(floor: string) {
    const floorSpots = this.parkingSpots.filter((spot) => spot.floor === floor);
    const spotNumbers = floorSpots.map((spot) =>
      parseInt(spot.id.substring(1))
    );
    const nextSpotNumber =
      spotNumbers.length > 0 ? Math.max(...spotNumbers) + 1 : 1;

    const newSpotId = `${floor}${nextSpotNumber}`;

    await this.parkingSpotService.addParkingSpot(floor, nextSpotNumber);

    this.loadParkingSpots();

    this.snackBar.open(
      `Parking spot ${newSpotId} added successfully`,
      'Close',
      {
        duration: 3000,
        panelClass: ['success-snackbar'],
      }
    );
  }

  async onClearParkingLayout() {
    try {
      await this.parkingSpotService.clearParkingLayout();
      await this.loadParkingSpots();
      this.snackBar.open('Parking layout cleared successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
      });
    } catch (error) {
      console.error('Error clearing parking layout:', error);
      this.snackBar.open('Failed to clear parking layout.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  async onPopulateDefaultLayout() {
    try {
      await this.parkingSpotService.populateDefaultParkingLayout();
      await this.loadParkingSpots();
      this.snackBar.open(
        'Parking layout populated with defaults successfully!',
        'Close',
        {
          duration: 3000,
          panelClass: ['success-snackbar'],
        }
      );
    } catch (error) {
      console.error('Error populating default parking layout:', error);
      this.snackBar.open(
        'Failed to populate default parking layout.',
        'Close',
        {
          duration: 3000,
          panelClass: ['error-snackbar'],
        }
      );
    }
  }
}
