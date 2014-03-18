package com.deniz.balanced.business;

import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface ExperienceBusinessService {

	/**
	 * Adds specified experience to user
	 * 
	 * @param username
	 *            name of the user which completes the mission
	 * @param expertise
	 *            hardness degree of mission
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if no user exist with such username
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void addExperience(String username, String expertise) throws DataNotExistException, NotValidIdException;

	/**
	 * Adds invitation bonus to ancestors
	 *
	 * @param username
	 *            name of the user which invites baby
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if no user exist with such username
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void addSignupExperience(String username) throws DataNotExistException, NotValidIdException;

}
