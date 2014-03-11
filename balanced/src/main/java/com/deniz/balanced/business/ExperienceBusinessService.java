package com.deniz.balanced.business;

import org.springframework.transaction.annotation.Transactional;

import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

@Transactional
public interface ExperienceBusinessService {

	/**
	 * Adds specified experience to user
	 * 
	 * @param username
	 *            name of the user which completes the mission
	 * @param expertise
	 *            hardness degree of mission
	 * @throws DataNotExistException
	 *             throws if no user exist with such username
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void addExperience(String username, String expertise) throws DataNotExistException, NotValidIdException;

	/**
	 * Adds invitation bonus to ancestors
	 * 
	 * @param username
	 *            name of the user which invites baby
	 * @throws DataNotExistException
	 *             throws if no user exist with such username
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void addSignupExperience(String username) throws DataNotExistException, NotValidIdException;

}
