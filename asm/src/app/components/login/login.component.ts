
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMsg = '';
  successMsg = '';
  showPassword = false;
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMsg = '';
    this.successMsg = '';
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.http.get<any[]>('/assets/data/user.json').subscribe(users => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user && user.username === 'admin') {
          localStorage.setItem('isAdmin', 'true');
          window.dispatchEvent(new Event('admin-login'));
          this.successMsg = 'Đăng nhập thành công! Đang chuyển hướng...';
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard']);
          }, 1200);
        } else {
          localStorage.removeItem('isAdmin');
          window.dispatchEvent(new Event('admin-login'));
          this.errorMsg = 'Sai thông tin đăng nhập hoặc không có quyền truy cập.';
        }
      }, err => {
        this.errorMsg = 'Không thể kiểm tra tài khoản. Vui lòng thử lại.';
      });
    } else {
      this.errorMsg = 'Biểu mẫu không hợp lệ';
    }
  }
}
