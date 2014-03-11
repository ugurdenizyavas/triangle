package com.deniz.balanced.framework.business.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Required;

import com.deniz.balanced.framework.business.FrameworkBackendService;
import com.deniz.balanced.framework.business.FrameworkBusinessService;
import com.deniz.balanced.framework.business.conversion.AbstractEntityDtoConverter;
import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.converter.business.ObjectConverterService;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import com.deniz.framework.persistence.entity.AbstractEntity;

public abstract class AbstractBusinessService<D extends AbstractDto, E extends AbstractEntity> implements FrameworkBusinessService<D> {

	protected ObjectConverterService objectConverterService;
	protected AbstractEntityDtoConverter<E, D> converter;

	protected abstract FrameworkBackendService<E> getBackendService();

	@Required
	public void setConverter(AbstractEntityDtoConverter<E, D> converter) {
		this.converter = converter;
	}

	@Required
	public void setObjectConverterService(ObjectConverterService objectConverterService) {
		this.objectConverterService = objectConverterService;
	}

	@Override
	public int getCount() {
		return getBackendService().getAll().size();
	}

	@Override
	public D getByName(String name) throws DataNotExistException {
		E abstractEntity = getBackendService().getByName(name);
		return this.converter.convertEntity(this.objectConverterService, abstractEntity);
	}

	@Override
	public List<D> getAll() {
		List<E> allEntities = getBackendService().getAll();
		return this.converter.convertEntityList(this.objectConverterService, allEntities);
	}

}
