import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: any;
}

export interface LoginData {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private users: any[] = [];
    private currentUser: any = null;

    constructor() {
        // Load users from localStorage if available
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }
    }

    login(loginData: LoginData): Observable<AuthResponse> {
        // Simulate API call with delay
        return new Observable(observer => {
            setTimeout(() => {
                const user = this.users.find(u =>
                    u.username === loginData.username && u.password === loginData.password
                );

                if (user) {
                    this.currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    observer.next({
                        success: true,
                        message: 'Đăng nhập thành công!',
                        user: user
                    });
                } else {
                    observer.next({
                        success: false,
                        message: 'Tên đăng nhập hoặc mật khẩu không đúng!'
                    });
                }
                observer.complete();
            }, 1000);
        });
    }

    register(registerData: RegisterData): Observable<AuthResponse> {
        // Simulate API call with delay
        return new Observable(observer => {
            setTimeout(() => {
                // Check if username or email already exists
                const existingUser = this.users.find(u =>
                    u.username === registerData.username || u.email === registerData.email
                );

                if (existingUser) {
                    observer.next({
                        success: false,
                        message: 'Tên đăng nhập hoặc email đã tồn tại!'
                    });
                } else {
                    // Add new user
                    const newUser = {
                        id: Date.now(),
                        username: registerData.username,
                        email: registerData.email,
                        password: registerData.password,
                        createdAt: new Date()
                    };

                    this.users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(this.users));

                    observer.next({
                        success: true,
                        message: 'Đăng ký thành công!',
                        user: newUser
                    });
                }
                observer.complete();
            }, 1000);
        });
    }

    logout(): void {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    getCurrentUser(): any {
        if (!this.currentUser) {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }
        }
        return this.currentUser;
    }

    isLoggedIn(): boolean {
        return !!this.getCurrentUser();
    }
}