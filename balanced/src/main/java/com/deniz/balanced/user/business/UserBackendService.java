package com.deniz.balanced.user.business;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.deniz.balanced.framework.business.FrameworkBackendService;
import com.deniz.balanced.user.business.exception.AncestorInviteLimitReachedException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.business.exception.PasswordWrongException;
import com.deniz.balanced.user.persistence.entity.UserEntity;

/**
 * Interface for backend to be seen from service layer <br>
 * Takes entities from dao layer, has all business logic
 * 
 * @author deniz.yavas
 * 
 */
public interface UserBackendService extends FrameworkBackendService<UserEntity> {
	/**
	 * Get all ancestors of current user
	 * 
	 * @param userId
	 *            (not nullable) id of the user to be checked
	 * @return list of ancestor entities
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	List<UserEntity> getAncestorEntities(Long userId) throws NotValidIdException;

	/**
	 * Get primary ancestor of current user by current user's id
	 * 
	 * @param userId
	 *            (not nullable) id of current user
	 * @return ancestor entity
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	UserEntity getAncestorByCurrentId(long userId) throws NotValidIdException;

	/**
	 * Get user by its email
	 * 
	 * @param email
	 *            (not nullable) email
	 * @return user entity
	 */
	UserEntity getByEmail(String email);

	/**
	 * Get user by its reference
	 * 
	 * @param reference
	 *            (not nullable) reference link
	 * @return user entity
	 */
	@Transactional
	UserEntity getByReference(String reference);

	/**
	 * Do login business for entity and given password
	 * 
	 * @param userId
	 *            id of the persistent entity from DB
	 * @param password
	 *            password supplied by user
	 * @throws PasswordWrongException
	 *             throws if password is wrong
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void login(long userId, String password) throws PasswordWrongException, NotValidIdException;

	/**
	 * Check old password; then change it to new password
	 * 
	 * @param userId
	 *            id of the user who changes password
	 * @param oldPassword
	 *            persisted password
	 * @param newPassword
	 *            new password which user enters
	 * @throws PasswordWrongException
	 *             throws if password is wrong
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void changePassword(long userId, String oldPassword, String newPassword) throws PasswordWrongException, NotValidIdException;

	/**
	 * Adds new user; hijack for first user
	 * 
	 * @param firstUser
	 *            root user
	 */
	@Transactional
	void newUser(UserEntity firstUser);

	/**
	 * Get number of children of given user
	 * 
	 * @param userId
	 *            id of specified user
	 * @return child count
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	@Transactional
	List<UserEntity> getChildren(long userId) throws NotValidIdException;

	/**
	 * Check invitation limit for user
	 * 
	 * @param userId
	 *            id of user
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 * @throws AncestorInviteLimitReachedException
	 *             throws if ancestor reached his invitation limit
	 */
	void checkInvitationLimit(long userId) throws NotValidIdException, AncestorInviteLimitReachedException;

	/**
	 * Gets all references
	 * 
	 * @return list of references
	 */
	List<String> getValidReferences();

}
