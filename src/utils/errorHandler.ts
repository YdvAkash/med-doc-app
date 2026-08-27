export const getUserFriendlyErrorMessage = (error: any): string => {
  // Check if error has a response from our backend API structure
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.message && data.code) {
      // Map specific machine-readable codes to user-friendly messages if needed,
      // though the backend already provides a user-friendly message.
      switch (data.code) {
        case 'EMAIL_ALREADY_EXISTS':
          return 'An account with this email already exists.';
        case 'INVALID_CREDENTIALS':
          return 'Incorrect email or password. Please try again.';
        case 'UNVERIFIED_ACCOUNT':
          return 'Your account is not verified. We have sent a new OTP to your email.';
        case 'INVALID_OTP':
          return 'Incorrect OTP. Please check the code and try again.';
        case 'OTP_EXPIRED':
          return 'This OTP has expired. Please request a new one.';
        case 'USER_NOT_FOUND':
        case 'EMAIL_NOT_REGISTERED':
          return 'We could not find an account with this email address.';
        case 'VALIDATION_ERROR':
          return data.message;
        default:
          return data.message || 'We could not complete your request. Please try again.';
      }
    }
  }

  // Handle standard Axios/Network errors
  if (error?.message) {
    if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      return 'Unable to connect. Please check your internet connection.';
    }
    // We want to avoid returning raw Axios errors to the user if they are cryptic.
    if (error.message.includes('status code 4')) {
      return 'There was a problem with your request. Please try again.';
    }
    if (error.message.includes('status code 5')) {
      return 'Service is temporarily unavailable. Please try again later.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
};
