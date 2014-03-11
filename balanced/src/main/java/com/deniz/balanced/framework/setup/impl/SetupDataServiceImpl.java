package com.deniz.balanced.framework.setup.impl;

import org.springframework.beans.factory.annotation.Required;

import com.deniz.balanced.business.AuthenticationBusinessService;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.setup.impl.AbstractSetupDataServiceImpl;

public class SetupDataServiceImpl extends AbstractSetupDataServiceImpl {

	private AuthenticationBusinessService authenticationBusinessService;
	private UserBackendService userBackendService;

	@Required
	public void setUserBackendService(UserBackendService userBackendService) {
		this.userBackendService = userBackendService;
	}

	@Override
	public void insertData() {
		// Hijack first user ancestor issue by adding it from backend
		UserEntity firstUser = new UserEntity();
		firstUser.setSimpleName("ozgen");
		firstUser.setPassword("123456");
		firstUser.setEmail("ozgenerdem@hotmail.com");
		firstUser.setReference("AUJ34DEW");
		this.userBackendService.newUser(firstUser);
	}
}
