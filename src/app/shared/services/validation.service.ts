import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor() {}

  /**
   * Validates a Romanian phone number
   * @param phoneNumber The phone number to validate
   * @returns True if the phone number is valid, false otherwise
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber || !phoneNumber.trim()) {
      return false;
    }

    // Check if phone number contains invalid characters
    const containsInvalidChars = /[^0-9+\s\-()]/.test(phoneNumber);
    if (containsInvalidChars) {
      return false;
    }

    // Clean the number for validation
    const cleanedNumber = phoneNumber.replace(/[\s\-()]/g, '');

    // Check Romanian phone number format
    const mobileRegex = /^(\+407|07)\d{8}$/;
    const landlineRegex = /^(\+402|02)\d{8}$/;

    return mobileRegex.test(cleanedNumber) || landlineRegex.test(cleanedNumber);
  }

  /**
   * Gets the phone number error message
   * @param phoneNumber The phone number to validate
   * @returns The error message or empty string if valid
   */
  getPhoneNumberErrorMessage(phoneNumber: string): string {
    if (!phoneNumber || !phoneNumber.trim()) {
      return 'You must enter a phone number';
    }

    const containsInvalidChars = /[^0-9+\s\-()]/.test(phoneNumber);
    if (containsInvalidChars) {
      return 'Phone number can only contain digits, +, spaces, hyphens and parentheses';
    }

    const cleanedNumber = phoneNumber.replace(/[\s\-()]/g, '');

    const mobileRegex = /^(\+407|07)\d{8}$/;
    const landlineRegex = /^(\+402|02)\d{8}$/;

    if (
      !(mobileRegex.test(cleanedNumber) || landlineRegex.test(cleanedNumber))
    ) {
      return 'Please enter a valid Romanian phone number';
    }

    return '';
  }

  /**
   * Validates a Romanian license plate
   * @param licensePlate The license plate to validate
   * @returns True if the license plate is valid, false otherwise
   */
  validateRomanianLicensePlate(licensePlate: string): boolean {
    if (!licensePlate || !licensePlate.trim()) {
      return false;
    }

    const plateRegex = /^[A-Z]{1,2}\s?[0-9]{2,3}\s?[A-Z]{3}$/;
    return plateRegex.test(licensePlate);
  }

  /**
   * Gets the license plate error message
   * @param licensePlate The license plate to validate
   * @returns The error message or empty string if valid
   */
  getLicensePlateErrorMessage(licensePlate: string): string {
    if (!licensePlate || !licensePlate.trim()) {
      return '';
    }

    if (!this.validateRomanianLicensePlate(licensePlate)) {
      return 'Not a valid Romanian license plate';
    }

    return '';
  }

  /**
   * Validates email format
   * @param email The email to validate
   * @returns True if the email is valid, false otherwise
   */
  validateEmail(email: string): boolean {
    if (!email || !email.trim()) {
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Gets the email error message
   * @param email The email to validate
   * @returns The error message or empty string if valid
   */
  getEmailErrorMessage(email: string): string {
    if (!email || !email.trim()) {
      return 'You must enter an email';
    }

    if (!this.validateEmail(email)) {
      return 'Not a valid email';
    }

    return '';
  }

  /**
   * Validates if passwords match
   * @param password The password
   * @param confirmPassword The confirmation password
   * @returns True if passwords match, false otherwise
   */
  validatePasswordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  /**
   * Gets the password match error message
   * @param password The password
   * @param confirmPassword The confirmation password
   * @returns The error message or empty string if valid
   */
  getPasswordMatchErrorMessage(
    password: string,
    confirmPassword: string,
  ): string {
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return '';
  }

  /**
   * Handles phone number key press to only allow valid characters
   * @param event The keyboard event
   * @returns True if the key is allowed, false otherwise
   */
  onPhoneNumberKeyPress(event: KeyboardEvent): boolean {
    const allowedChars = /[0-9\+\s\-\(\)]/;
    const inputChar = event.key;

    if (inputChar.length === 1 && !allowedChars.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}
