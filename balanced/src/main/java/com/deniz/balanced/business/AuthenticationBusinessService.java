package com.deniz.balanced.business;

import org.springframework.transaction.annotation.Transactional;

import com.deniz.balanced.user.business.exception.AncestorInviteLimitReachedException;
import com.deniz.balanced.user.business.exception.AncestorNotExistsException;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.EmailNotValidException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.business.exception.PasswordNotMatchedException;
import com.deniz.balanced.user.business.exception.PasswordNotSecureException;
import com.deniz.balanced.user.business.exception.PasswordWrongException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

/**
 * Authentication related services which serve an interface to be seen from
 * service layer
 * 
 * @author deniz.yavas
 * 
 */
@Transactional
public interface AuthenticationBusinessService {
	// TODO: Make authentication backend service as well
	/**
	 * If user exist and password is correct; do the login process for user <br>
	 * <b>TODO: Email should be available for login as well</b>
	 * 
	 * @param username
	 *            (not nullable) username which is predefined
	 * @param password
	 *            (not nullable) encrypted password
	 * @throws DataNotExistException
	 *             throws if user does not exist
	 * @throws PasswordWrongException
	 *             throws if password is wrong for given user
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void login(String username, String password) throws DataNotExistException, PasswordWrongException, NotValidIdException;

	/**
	 * Changes password with given one if user exists; old password is right and
	 * password and check is same
	 * 
	 * @param username
	 *            (not nullable) username which is predefined
	 * @param password
	 *            (not nullable) encrypted new password
	 * @param passwordCheck
	 *            (not nullable) check for encrypted new password
	 * @param oldPassword
	 *            (not nullable) encrypted current password
	 * @throws PasswordWrongException
	 *             throws if password is wrong for given user
	 * @throws PasswordNotMatchedException
	 *             throws if password and check do not match
	 * @throws DataNotExistException
	 *             throws if user does not exist
	 * @throws PasswordNotSecureException
	 *             TODO: Add check for if password is secure enough
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void changePassword(String username, String password, String passwordCheck, String oldPassword) throws PasswordWrongException, PasswordNotMatchedException,
			DataNotExistException, PasswordNotSecureException, NotValidIdException;

	/**
	 * Sign up user add experience to its ancestors
	 * 
	 * @param username
	 *            (not nullable) username to use in login process
	 * @param password
	 *            (not nullable) encrypted password
	 * @param passwordCheck
	 *            (not nullable) encrypted password to check
	 * @param email
	 *            (not nullable) email of user
	 * @param ancestorRef
	 *            (not nullable) reference link for the ancestor of user; only
	 *            blank for the root user who does not need to signup
	 * @throws EmailNotValidException
	 *             throws if email failed in validation
	 * @throws PasswordNotSecureException
	 *             TODO: Add check for if password is secure enough
	 * @throws PasswordNotMatchedException
	 *             throws if password and check do not match
	 * @throws AncestorNotExistsException
	 *             throws if ancestor does not exist
	 * @throws DataAlreadyExistsException
	 *             throws if same username exists
	 * @throws DataNotExistException
	 *             throws if user with name does not exist
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 * @throws AncestorInviteLimitReachedException
	 *             throws if ancestor reached his invitation limit
	 * 
	 */
	void signup(String username, String password, String passwordCheck, String email, String ancestorRef) throws EmailNotValidException,
			PasswordNotSecureException, PasswordNotMatchedException, AncestorNotExistsException, DataAlreadyExistException, DataNotExistException,
			NotValidIdException, AncestorInviteLimitReachedException;
}
