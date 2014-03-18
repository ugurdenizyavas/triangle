package com.deniz.balanced.user.business;

import com.deniz.balanced.framework.business.FrameworkBusinessService;
import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Interface for business layer to be seen from service layer <br>
 * Gets entities from backend service and convert them to be used in service
 * layer
 * 
 * @author deniz.yavas
 * 
 */
@Transactional
public interface UserBusinessService extends FrameworkBusinessService<UserDto> {

	/**
	 * Gets first ancestor of current user by its id
	 * 
	 * @param username
	 *            username of current user (not nullable)
	 * @return ancestor dto
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if user with given username does not exist
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 *             throws if a critical fail is detected
	 */
	UserDto getPrimaryAncestor(String username) throws DataNotExistException, NotValidIdException;

	/**
	 * Gets list of ancestors of current user by its username
	 *
	 * @param username
	 *            username of current user (not nullable)
	 * @return list of ancestor dtos
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if user with given username does not exist
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 *             throws if a critical fail is detected
	 */
	List<UserDto> getAncestors(String username) throws DataNotExistException, NotValidIdException;

	/**
	 * Gets the number of childs for current user
	 *
	 * @param username
	 *            username of current user (not nullable)
	 * @return count of childs
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if user with given username does not exist
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 *             throws if a critical fail is detected
	 */
	List<UserDto> getChildren(String username) throws DataNotExistException, NotValidIdException;

	/**
	 * Gets all valid references in system
	 * 
	 * @return list of references
	 */
	List<String> getValidReferences();

}
