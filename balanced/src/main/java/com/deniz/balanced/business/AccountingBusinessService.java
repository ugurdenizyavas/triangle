package com.deniz.balanced.business;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.deniz.balanced.user.business.domain.UserDto;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

@Transactional
public interface AccountingBusinessService {

	/**
	 * Deposits money for this user and its ancestors
	 * 
	 * @param username
	 *            name of the user who invites baby
	 * @throws DataNotExistException
	 *             throws if user with given username does not exist
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void depositMoney(String username) throws DataNotExistException, NotValidIdException;

	/**
	 * Withdraws money from the user with name given
	 * 
	 * @param username
	 *            name of the user
	 * @throws DataNotExistException
	 *             throws if user with given username does not exist
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void withdrawMoney(String username) throws DataNotExistException, NotValidIdException;

	/**
	 * Get all users sort by wealth
	 * 
	 * @return user dto list
	 */
	List<UserDto> getUsersSortWealth();

}
