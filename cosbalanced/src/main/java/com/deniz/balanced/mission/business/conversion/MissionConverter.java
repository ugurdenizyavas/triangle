package com.deniz.balanced.mission.business.conversion;

import com.deniz.balanced.framework.business.conversion.AbstractEntityDtoConverter;
import com.deniz.balanced.mission.business.domain.MissionDto;
import com.deniz.balanced.mission.persistence.entity.MissionEntity;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

public class MissionConverter extends AbstractEntityDtoConverter<MissionEntity, MissionDto> {

	@Override
	protected MissionDto createNewDto() {
		return new MissionDto();
	}

	@Override
	public Class<?> getSupportedClass() {
		return MissionEntity.class;
	}

	@Override
	protected String doConvertToString(Object value) {
		return ((MissionEntity) value).getSimpleName();
	}

	@Override
	protected Object doConvertToX(String value) throws DataNotExistException {
		return this.backendService.getByName(value);
	}

	@Override
	protected MissionEntity createNewEntity() {
		return new MissionEntity();
	}

}
