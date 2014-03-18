package com.deniz.balanced.framework.business;

import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import com.deniz.framework.persistence.entity.AbstractEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FrameworkBackendService<E extends AbstractEntity> {

	/**
	 * Gets abstract entity by its id
	 * 
	 * @param id
	 *            id of Abstract Entity
	 * @return Abstract Entity
	 */
	public E getById(long id) throws NotValidIdException;

	/**
	 * Gets abstract entity by its name
	 * 
	 * @param name
	 *            name of Abstract Entity
	 * @return Abstract Entity
	 */
	public E getByName(String name) throws DataNotExistException;;

	/**
	 * Persists abstract entity
	 * 
	 * @param entity
	 *            entity to be saved
	 * @throws com.deniz.balanced.user.business.exception.DataAlreadyExistException
	 *             throws if any data uniqueness is violated
	 */
	public void save(E entity) throws DataAlreadyExistException;

	/**
	 * Gets all persisted entities
	 * 
	 * @return all entities
	 */
	public List<E> getAll();

	/**
	 * Updates entity as given
	 * 
	 * @param entity
	 *            entity with updated values
	 */
	void update(E entity);

	/**
	 * Delete all persistent entities
	 */
	@Transactional
	void deleteAll();
}
