package com.deniz.balanced.business.impl;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import com.deniz.balanced.framework.business.conversion.AbstractEntityDtoConverter;
import com.deniz.balanced.business.AccountingBusinessService;
import com.deniz.balanced.business.AuthenticationBusinessService;
import com.deniz.balanced.business.ExperienceBusinessService;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.domain.BabyDto;
import com.deniz.balanced.user.business.exception.AncestorInviteLimitReachedException;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.EmailNotValidException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.business.exception.PasswordNotMatchedException;
import com.deniz.balanced.user.business.exception.PasswordNotSecureException;
import com.deniz.balanced.user.business.exception.PasswordWrongException;
import com.deniz.balanced.business.validation.ValidationService;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.dto.converter.business.ObjectConverterService;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

public class AuthenticationBusinessServiceImpl implements AuthenticationBusinessService {

	private final Logger logger = LoggerFactory.getLogger(getClass());
	private UserBackendService userBackendService;
	private ValidationService validationService;
	private ObjectConverterService objectConverterService;
	private AbstractEntityDtoConverter<UserEntity, BabyDto> userConverter;
	private int lengthOfReference;
	private ExperienceBusinessService experienceBusinessService;
	private AccountingBusinessService accountingBusinessService;

	@Required
	public void setAccountingBusinessService(AccountingBusinessService accountingBusinessService) {
		this.accountingBusinessService = accountingBusinessService;
	}

	@Required
	public void setExperienceBusinessService(ExperienceBusinessService experienceBusinessService) {
		this.experienceBusinessService = experienceBusinessService;
	}

	@Required
	public void setLengthOfReference(int lengthOfReference) {
		this.lengthOfReference = lengthOfReference;
	}

	@Required
	public void setUserConverter(AbstractEntityDtoConverter<UserEntity, BabyDto> userConverter) {
		this.userConverter = userConverter;
	}

	@Required
	public void setObjectConverterService(ObjectConverterService objectConverterService) {
		this.objectConverterService = objectConverterService;
	}

	@Required
	public void setUserBackendService(UserBackendService userBackendService) {
		this.userBackendService = userBackendService;
	}

	@Required
	public void setValidationService(ValidationService validationService) {
		this.validationService = validationService;
	}

	@Override
	public void login(String username, String password) throws DataNotExistException, PasswordWrongException, NotValidIdException {
		Validate.notNull(username);
		Validate.notNull(password);
		UserEntity userEntity = this.userBackendService.getByName(username);
		this.userBackendService.login(userEntity.getId(), password);
	}

	@Override
	public void changePassword(String username, String password, String passwordCheck, String oldPassword) throws PasswordWrongException,
			PasswordNotMatchedException, DataNotExistException, PasswordNotSecureException, NotValidIdException {
		Validate.notNull(username);
		Validate.notNull(passwordCheck);
		Validate.notNull(password);
		Validate.notNull(oldPassword);
		if (!StringUtils.equals(passwordCheck, password)) {
			this.logger.info("Password and check password does not match.");
			throw new PasswordNotMatchedException();
		} else {
			UserEntity userEntity = this.userBackendService.getByName(username);
			validationService.validatePassword(password);
			this.userBackendService.changePassword(userEntity.getId(), oldPassword, password);
		}
	}

	@Override
	public void signup(String username, String password, String passwordCheck, String email, String ancestorRef) throws PasswordNotSecureException,
			PasswordNotMatchedException, EmailNotValidException, DataNotExistException, DataAlreadyExistException, NotValidIdException, DataNotExistException,
			AncestorInviteLimitReachedException {
		Validate.notNull(username);
		Validate.notNull(password);
		Validate.notNull(passwordCheck);
		Validate.notNull(email);
		Validate.notNull(ancestorRef);
		this.validationService.validateEmail(email);
		if (!StringUtils.equals(passwordCheck, password)) {
			this.logger.info("Password and check password does not match.");
			throw new PasswordNotMatchedException();
		} else {
			validationService.validatePassword(password);
			UserEntity existingUserWithName = null;
			try {
				existingUserWithName = this.userBackendService.getByName(username);
			} catch (DataNotExistException e) {
				this.logger.debug("User with name " + username + " does not exist; continue to signup process.");
			}
			if (existingUserWithName != null) {
				this.logger.info("User with name " + username + " already exists");
				throw new DataAlreadyExistException();
			} else {
				UserEntity existingUserWithEmail = this.userBackendService.getByEmail(email);
				if (existingUserWithEmail != null) {
					this.logger.info("User with email " + email + " already exists");
					throw new DataAlreadyExistException();
				} else {
					BabyDto babyDto = new BabyDto();
					babyDto.getSimpleNameMeta().setValue(username);
					babyDto.getPasswordMeta().setValue(password);
					babyDto.getEmailMeta().setValue(email);
					UserEntity ancestor = this.userBackendService.getByReference(ancestorRef);
					if (ancestor == null) {
						throw new DataNotExistException();
					}
					checkAncestorInvitationLimit(ancestor);
					babyDto.getAncestorMeta().setValue(ancestor.getSimpleName());
					UserEntity newUser = this.userConverter.convertDto(this.objectConverterService, babyDto);
					newUser.createNewReference(this.lengthOfReference);
					this.userBackendService.save(newUser);

					// TODO: Remove this later
					this.accountingBusinessService.withdrawMoney(username);

					try {
						this.experienceBusinessService.addSignupExperience(ancestor.getSimpleName());
						this.accountingBusinessService.depositMoney(ancestor.getSimpleName());
					} catch (DataNotExistException e) {
						this.logger.error("Programming error. Ancestor exists! It has been checked before");
					}
				}
			}
		}
	}

	private void checkAncestorInvitationLimit(UserEntity ancestor) throws AncestorInviteLimitReachedException, NotValidIdException {
		this.userBackendService.checkInvitationLimit(ancestor.getId());
	}
}
