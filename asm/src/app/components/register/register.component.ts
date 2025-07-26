import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';

  constructor(private http: HttpClient) {}

  register() {
    const newUser = { username: this.username, email: this.email, password: this.password };
    this.http.post('http://localhost:3000/api/update-user', newUser).subscribe(() => {
      alert('Registration successful!');
    });
  }
}