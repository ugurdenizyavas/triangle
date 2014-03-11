package com.deniz.balanced.business.conversion;

import com.deniz.balanced.framework.business.conversion.AbstractEntityDtoConverter;
import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

public class UserConverter extends AbstractEntityDtoConverter<UserEntity, UserDto> {

	@Override
	public Class<?> getSupportedClass() {
		return UserEntity.class;
	}

	@Override
	protected String doConvertToString(Object value) {
		return ((UserEntity) value).getSimpleName();
	}

	@Override
	protected Object doConvertToX(String value) throws DataNotExistException {
		return this.backendService.getByName(value);
	}

	@Override
	protected UserDto createNewDto() {
		return new UserDto();
	}

	@Override
	protected UserEntity createNewEntity() {
		return new UserEntity();
	}
}
