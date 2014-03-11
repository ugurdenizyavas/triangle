package com.deniz.balanced.user.business.impl;

import java.util.List;

import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import com.deniz.balanced.framework.business.FrameworkBackendService;
import com.deniz.balanced.framework.business.impl.AbstractBusinessService;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.UserBusinessService;
import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

public class UserBusinessServiceImpl extends AbstractBusinessService<UserDto, UserEntity> implements UserBusinessService {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	protected UserBackendService backendService;

	@Override
	protected FrameworkBackendService<UserEntity> getBackendService() {
		return this.backendService;
	}

	@Required
	public void setBackendService(UserBackendService backendService) {
		this.backendService = backendService;
	}

	@Override
	public UserDto getPrimaryAncestor(String username) throws DataNotExistException, NotValidIdException {
		Validate.notNull(username);

		UserEntity user = this.backendService.getByName(username);
		if (user == null) {
			throw new DataNotExistException();
		}
		UserEntity ancestor = this.backendService.getAncestorByCurrentId(user.getId());
		return this.converter.convertEntity(this.objectConverterService, ancestor);
	}

	@Override
	public List<UserDto> getAncestors(String username) throws DataNotExistException, NotValidIdException {
		Validate.notNull(username);

		UserEntity user = this.backendService.getByName(username);
		if (user == null) {
			throw new DataNotExistException();
		}
		List<UserEntity> ancestorEntities = this.backendService.getAncestorEntities(user.getId());
		return this.converter.convertEntityList(this.objectConverterService, ancestorEntities);
	}

	@Override
	public List<UserDto> getChildren(String username) throws DataNotExistException, NotValidIdException {
		Validate.notNull(username);

		UserEntity user = this.backendService.getByName(username);
		List<UserEntity> childrenEntities = this.backendService.getChildren(user.getId());
		return this.converter.convertEntityList(this.objectConverterService, childrenEntities);
	}

	@Override
	public List<String> getValidReferences() {
		return this.backendService.getValidReferences();
	}

}
