package com.deniz.balanced.business.validation.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.deniz.balanced.user.business.exception.EmailNotValidException;
import com.deniz.balanced.user.business.exception.PasswordNotSecureException;
import com.deniz.balanced.business.validation.ValidationService;
import com.deniz.balanced.business.validation.impl.validator.EmailValidator;
import com.deniz.balanced.business.validation.impl.validator.PasswordValidator;
import com.deniz.framework.dto.Meta;

public class ValidationServiceImpl implements ValidationService {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	PasswordValidator passwordValidator;
	EmailValidator emailValidator;

	public void setEmailValidator(EmailValidator emailValidator) {
		this.emailValidator = emailValidator;
	}

	public void setPasswordValidator(PasswordValidator passwordValidator) {
		this.passwordValidator = passwordValidator;
	}

	@Override
	public void validateEmail(String email) throws EmailNotValidException {
		Meta meta = new Meta(email);
		emailValidator.validate(meta);
		if (meta.getHasErrors()) {
			throw new EmailNotValidException();
		}
	}

	@Override
	public void validatePassword(String password) throws PasswordNotSecureException {
		Meta meta = new Meta(password);
		passwordValidator.validate(meta);
		// TODO: Add password check
		// if (meta.getHasErrors()) {
		// throw new PasswordNotSecureException();
		// }
	}
}
