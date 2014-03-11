package com.deniz.balanced.framework.business.conversion;

import java.util.ArrayList;
import java.util.List;

import com.deniz.balanced.framework.business.FrameworkBackendService;
import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.converter.business.ObjectConverterService;
import com.deniz.framework.dto.converter.business.impl.valueconverter.impl.converter.ConverterTemplate;
import com.deniz.framework.persistence.entity.AbstractEntity;

public abstract class AbstractEntityDtoConverter<E extends AbstractEntity, D extends AbstractDto> extends ConverterTemplate {

	protected FrameworkBackendService<E> backendService;

	public void setBackendService(FrameworkBackendService<E> backendService) {
		this.backendService = backendService;
	}

	public D convertEntity(ObjectConverterService objectConverterService, E entity) {
		D dto = createNewDto();
		objectConverterService.copyPropertiesToMetas(entity, dto);
		return dto;
	}

	public List<D> convertEntityList(ObjectConverterService objectConverterService, List<E> entityList) {
		List<D> ancestorDtos = new ArrayList<D>();
		if (entityList != null) {
			for (E ancestorEntity : entityList) {
				D ancestorDto = convertEntity(objectConverterService, ancestorEntity);
				ancestorDtos.add(ancestorDto);
			}
		}
		return ancestorDtos;
	}

	protected abstract D createNewDto();

	public E convertDto(ObjectConverterService objectConverterService, D dto) {
		E entity = createNewEntity();
		objectConverterService.copyMetasToProperties(dto, entity);
		return entity;
	}

	protected abstract E createNewEntity();
}
