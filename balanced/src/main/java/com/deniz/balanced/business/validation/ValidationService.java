package com.deniz.balanced.business.validation;

import com.deniz.balanced.user.business.exception.EmailNotValidException;
import com.deniz.balanced.user.business.exception.PasswordNotSecureException;

public interface ValidationService {

	void validateEmail(String email) throws EmailNotValidException;

	void validatePassword(String password) throws PasswordNotSecureException;

}
