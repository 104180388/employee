import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Employee {
  id: number;
  name: string;
  contact: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('employees');
  protected employees = signal<Employee[]>([]);
  protected editingId = signal<number | null>(null);
  protected formData = signal({
    name: '',
    contact: '',
    email: '',
    role: ''
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.http.get<Employee[]>('http://localhost:3000/employees').subscribe(data => {
      this.employees.set(data);
    });
  }

  deleteEmployee(id: number) {
    this.http.delete(`http://localhost:3000/employees/${id}`).subscribe(() => {
      this.loadEmployees();
    });
  }

  startEdit(employee: Employee) {
    this.editingId.set(employee.id);
    this.formData.set({
      name: employee.name,
      contact: employee.contact,
      email: employee.email,
      role: employee.role
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.formData.set({
      name: '',
      contact: '',
      email: '',
      role: ''
    });
  }

  saveEdit() {
    const id = this.editingId();
    const data = this.formData();
    if (id) {
      this.http.put(`http://localhost:3000/employees/${id}`, data).subscribe(() => {
        this.loadEmployees();
        this.cancelEdit();
      });
    }
  }

  addEmployee() {
    const data = this.formData();
    const employees = this.employees();
    const maxId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) : 0;
    const newEmployee = { ...data, id: `${maxId + 1}` };
    
    this.http.post('http://localhost:3000/employees', newEmployee).subscribe(() => {
      this.loadEmployees();
      this.formData.set({
        name: '',
        contact: '',
        email: '',
        role: ''
      });
    });
  }
}
