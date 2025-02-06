import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppComponent } from '../../app.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-area',
  templateUrl: './new-area.component.html',
  styleUrls: ['./new-area.component.css']
})
export class NewAreaComponent {
  dataForm: FormGroup;
  areas: any[] = []; // Stores all areas
  modalTitle: string = ''; // Title for the modal
  isEditMode: boolean = false; // Flag to distinguish between add and edit mode
  selectedArea: any = null; // Stores the area being edited

  constructor(private fb: FormBuilder, private http: HttpClient, private app: AppComponent) {
    // Initialize form
    this.dataForm = this.fb.group({
      area: ['', [Validators.required]],
      address: ['', [Validators.required]],
      lat: ['', [Validators.required, Validators.pattern(/^[-+]?[0-9]*\.?[0-9]+$/)]],
      lon: ['', [Validators.required, Validators.pattern(/^[-+]?[0-9]*\.?[0-9]+$/)]],
      dry: [0, [Validators.required, Validators.min(0)]],
      wet: [0, [Validators.required, Validators.min(0)]],
      rf_id: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.fetchAreas(); // Load areas when component initializes
  }

  // Fetch areas from backend
  fetchAreas() {
    const url = `${this.app.baseUrl}getAllAreas`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.areas = data; // Populate the table
      },
      error: (err) => {
        console.error('Error fetching areas:', err);
      }
    });
  }

  // Open modal for adding a new area
  openAddModal() {
    this.isEditMode = false;
    this.modalTitle = 'Add Area';
    this.dataForm.reset(); // Clear the form
    const modal = document.getElementById('areaModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  // Open modal for editing an area
  openEditModal(area: any) {
    this.isEditMode = true;
    this.modalTitle = 'Edit Area';
    this.selectedArea = area;
    this.dataForm.patchValue(area); // Prepopulate form with selected area's data
    const modal = document.getElementById('areaModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  // Close modal
  closeModal() {
    const modal = document.getElementById('areaModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Handle form submission
  onSubmit() {
    if (this.dataForm.valid) {
      if (this.isEditMode) {
        this.updateArea();
      } else {
        this.addArea();
      }
    } else {
      console.error('Form is invalid!');
    }
  }

  // Add new area
  addArea() {
    const url = `${this.app.baseUrl}addArea`;
    this.http.post(url, this.dataForm.value).subscribe({
      next: () => {
        this.fetchAreas(); // Refresh the list
        this.closeModal();
      },
      error: (err) => {
        console.error('Error adding area:', err);
      }
    });
  }

  // Update existing area
  updateArea() {
    const url = `${this.app.baseUrl}updateArea`;
    this.http.put(url, this.dataForm.value).subscribe({
      next: () => {
        this.fetchAreas(); // Refresh the list
        this.closeModal();
      },
      error: (err) => {
        console.error('Error updating area:', err);
      }
    });
  }
}
