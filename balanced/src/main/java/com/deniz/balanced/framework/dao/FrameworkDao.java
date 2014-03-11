package com.deniz.balanced.framework.dao;

import java.util.List;

import com.deniz.framework.persistence.entity.AbstractEntity;

public interface FrameworkDao<E extends AbstractEntity> {

	/**
	 * Gets user entity by its id
	 * 
	 * @param id
	 *            (not nullable) id of user
	 * @return user entity
	 */
	E getById(long id);

	/**
	 * Gets entity by its name
	 * 
	 * @param name
	 *            (not nullable)
	 * @return entity
	 */
	E getByName(String name);

	/**
	 * persists given abstract entity
	 * 
	 * @param entity
	 *            (not nullable)
	 */
	void save(E entity);

	/**
	 * Gets all
	 * 
	 * @return all entities
	 */
	List<E> getAll();

	/**
	 * Removes all entities
	 */
	void removeAll();
}
