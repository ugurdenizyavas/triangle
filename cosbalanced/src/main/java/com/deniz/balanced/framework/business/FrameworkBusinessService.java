package com.deniz.balanced.framework.business;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional
public interface FrameworkBusinessService<D extends AbstractDto> {

	/**
	 * Returns total number of users in the system
	 * 
	 * @return count of users
	 */
	int getCount();

	/**
	 * Gets user by its username
	 * 
	 * @return user dto
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if data does not exist with given name
	 */
	D getByName(String name) throws DataNotExistException;

	/**
	 * Gets all users
	 * 
	 * @return all users
	 */
	List<D> getAll();
}
