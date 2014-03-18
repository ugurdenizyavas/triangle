package com.deniz.balanced.business;

import com.deniz.balanced.user.business.exception.*;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication related services which serve an interface to be seen from
 * service layer
 *
 * @author deniz.yavas
 */
@Transactional
public interface AuthenticationBusinessService {
    // TODO: Make authentication backend service as well

    /**
     * If user exist and password is correct; do the login process for user <br>
     * <b>TODO: Email should be available for login as well</b>
     *
     * @param username (not nullable) username which is predefined
     * @param password (not nullable) encrypted password
     * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException  throws if user does not exist
     * @throws com.deniz.balanced.user.business.exception.PasswordWrongException throws if password is wrong for given user
     * @throws com.deniz.balanced.user.business.exception.NotValidIdException    throws if a critical fail is detected
     */
    void login(String username, String password) throws DataNotExistException, PasswordWrongException, NotValidIdException;

    /**
     * Changes password with given one if user exists; old password is right and
     * password and check is same
     *
     * @param username      (not nullable) username which is predefined
     * @param password      (not nullable) encrypted new password
     * @param passwordCheck (not nullable) check for encrypted new password
     * @param oldPassword   (not nullable) encrypted current password
     * @throws com.deniz.balanced.user.business.exception.PasswordWrongException      throws if password is wrong for given user
     * @throws com.deniz.balanced.user.business.exception.PasswordNotMatchedException throws if password and check do not match
     * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException       throws if user does not exist
     * @throws com.deniz.balanced.user.business.exception.PasswordNotSecureException  TODO: Add check for if password is secure enough
     * @throws com.deniz.balanced.user.business.exception.NotValidIdException         throws if a critical fail is detected
     */
    void changePassword(String username, String password, String passwordCheck, String oldPassword) throws PasswordWrongException, PasswordNotMatchedException,
            DataNotExistException, PasswordNotSecureException, NotValidIdException;

    /**
     * Sign up user add experience to its ancestors
     *
     * @param username      (not nullable) username to use in login process
     * @param password      (not nullable) encrypted password
     * @param passwordCheck (not nullable) encrypted password to check
     * @param email         (not nullable) email of user
     * @param ancestorRef   (not nullable) reference link for the ancestor of user; only
     *                      blank for the root user who does not need to signup
     * @throws com.deniz.balanced.user.business.exception.EmailNotValidException              throws if email failed in validation
     * @throws com.deniz.balanced.user.business.exception.PasswordNotSecureException          TODO: Add check for if password is secure enough
     * @throws com.deniz.balanced.user.business.exception.PasswordNotMatchedException         throws if password and check do not match
     * @throws com.deniz.balanced.user.business.exception.AncestorNotExistsException          throws if ancestor does not exist
     * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException               throws if user with name does not exist
     * @throws com.deniz.balanced.user.business.exception.NotValidIdException                 throws if a critical fail is detected
     * @throws com.deniz.balanced.user.business.exception.AncestorInviteLimitReachedException throws if ancestor reached his invitation limit
     */
    void signup(String username, String password, String passwordCheck, String email, String ancestorRef) throws EmailNotValidException,
            PasswordNotSecureException, PasswordNotMatchedException, AncestorNotExistsException, DataAlreadyExistException, DataNotExistException,
            NotValidIdException, AncestorInviteLimitReachedException;
}
