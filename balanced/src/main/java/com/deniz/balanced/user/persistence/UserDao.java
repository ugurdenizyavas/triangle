package com.deniz.balanced.user.persistence;

import java.util.List;

import com.deniz.balanced.framework.dao.FrameworkDao;
import com.deniz.balanced.user.persistence.entity.UserEntity;

/**
 * Dao related logic (Has no logic at all)
 * 
 * @author deniz.yavas
 * 
 */
public interface UserDao extends FrameworkDao<UserEntity> {

	/**
	 * Gets user entity by its reference link
	 * 
	 * @param reference
	 *            (not nullable)
	 * @return user entity
	 */
	UserEntity getByReference(String reference);

	/**
	 * Gets user entity by its email
	 * 
	 * @param email
	 *            (not nullable)
	 * @return user entity
	 */
	UserEntity getByEmail(String email);

	/**
	 * Get childs of given user
	 * 
	 * @param userId
	 *            specified user
	 * @return list of children
	 */
	List<UserEntity> getChilds(UserEntity user);

	/**
	 * Gets all users with given sort order
	 * 
	 * @param sortOrder
	 *            field of user to sort with
	 */
	List<UserEntity> getAll(String sortOrder);

	/**
	 * Gets list of given field values
	 * 
	 * @param field
	 *            field of entity
	 * @return list of values
	 */
	List<String> getAllType(String field);

}
