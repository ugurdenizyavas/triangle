package com.deniz.balanced.business.impl;

import com.deniz.balanced.business.AccountingBackendService;
import com.deniz.balanced.business.AccountingBusinessService;
import com.deniz.balanced.business.conversion.UserConverter;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.dto.converter.business.ObjectConverterService;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.apache.commons.lang.Validate;
import org.springframework.beans.factory.annotation.Required;

import java.util.List;

public class AccountingBusinessServiceImpl implements AccountingBusinessService {

	private AccountingBackendService accountingBackendService;
	private UserBackendService userBackendService;
	private String membershipFee;
	private UserConverter userConverter;
	private ObjectConverterService objectConverterService;

	@Required
	public void setObjectConverterService(ObjectConverterService objectConverterService) {
		this.objectConverterService = objectConverterService;
	}

	@Required
	public void setUserConverter(UserConverter userConverter) {
		this.userConverter = userConverter;
	}

	@Required
	public void setUserBackendService(UserBackendService userBackendService) {
		this.userBackendService = userBackendService;
	}

	@Required
	public void setMembershipFee(String membershipFee) {
		this.membershipFee = membershipFee;
	}

	@Required
	public void setAccountingBackendService(AccountingBackendService accountingBackendService) {
		this.accountingBackendService = accountingBackendService;
	}

	@Override
	public void depositMoney(String username) throws DataNotExistException, NotValidIdException {
		Validate.notNull(username);
		UserEntity userEntity = this.userBackendService.getByName(username);
		this.accountingBackendService.addMoney(userEntity.getId(), Double.parseDouble(this.membershipFee));
	}

	@Override
	public void withdrawMoney(String username) throws DataNotExistException, NotValidIdException {
		Validate.notNull(username);
		UserEntity userEntity = this.userBackendService.getByName(username);
		this.accountingBackendService.withdrawMoney(userEntity.getId(), Double.parseDouble(this.membershipFee));
	}

	@Override
	public List<UserDto> getUsersSortWealth() {
		List<UserEntity> users = this.accountingBackendService.getUsersSortWealth();
		return this.userConverter.convertEntityList(this.objectConverterService, users);
	}

}
