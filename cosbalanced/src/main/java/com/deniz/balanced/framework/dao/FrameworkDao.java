package com.deniz.balanced.framework.dao;

import com.deniz.framework.persistence.entity.AbstractEntity;

import java.util.List;

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
