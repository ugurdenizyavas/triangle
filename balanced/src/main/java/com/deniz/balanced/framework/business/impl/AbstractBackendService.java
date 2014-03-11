package com.deniz.balanced.framework.business.impl;

import java.util.List;

import org.apache.commons.lang.Validate;
import org.springframework.dao.DataIntegrityViolationException;

import com.deniz.balanced.framework.business.FrameworkBackendService;
import com.deniz.balanced.framework.dao.FrameworkDao;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import com.deniz.framework.persistence.entity.AbstractEntity;

public abstract class AbstractBackendService<E extends AbstractEntity> implements FrameworkBackendService<E> {

	protected abstract FrameworkDao<E> getDao();

	@Override
	public E getById(long id) throws NotValidIdException {
		Validate.notNull(id);
		E entity = this.getDao().getById(id);
		if (entity == null) {
			throw new NotValidIdException("Programming error. Id should never be null.");
		}
		return entity;
	}

	@Override
	public E getByName(String name) throws DataNotExistException {
		E entity = this.getDao().getByName(name);
		if (entity == null) {
			throw new DataNotExistException();
		}
		return entity;
	}

	@Override
	public void save(E entity) throws DataAlreadyExistException {
		try {
			this.getDao().save(entity);
		} catch (DataIntegrityViolationException e1) {
			// It is not likely but system may create the same reference; No
			// need to show this to user
			throw new DataAlreadyExistException("Entity exists.");
		}
	}

	@Override
	public void update(E entity) {
		this.getDao().save(entity);
	}

	@Override
	public List<E> getAll() {
		return this.getDao().getAll();
	}

	@Override
	public void deleteAll() {
		this.getDao().removeAll();
	}

}
