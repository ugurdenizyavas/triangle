package com.deniz.balanced.mission.business;

import com.deniz.balanced.framework.business.FrameworkBackendService;
import com.deniz.balanced.mission.persistence.entity.MissionEntity;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

import java.util.Date;
import java.util.List;

/**
 * Interface for backend to be seen from service layer <br>
 * Takes entities from dao layer, has all business logic
 * 
 * @author deniz.yavas
 * 
 */
public interface MissionBackendService extends FrameworkBackendService<MissionEntity> {

	/**
	 * Gets valid mission entities at specified day
	 * 
	 * @param validity
	 *            specified day
	 * @return list of mission entities
	 */
	List<MissionEntity> getValidMissions(Date validity);

	/**
	 * Check if user has already completed that mission
	 * 
	 * @param userId
	 *            user to be checked
	 * @param missionId
	 *            mission to be checked
	 * @return true if user has completed; false if not
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if user or mission with given names does not exist
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 */
	boolean checkCompletionStatus(long userId, long missionId) throws DataNotExistException, NotValidIdException;

	/**
	 * Mark specified mission for specified user is completed
	 *
	 * @param userId
	 *            user who completed that mission
	 * @param missionId
	 *            completed mission
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if user or mission with given dto not exist
	 */
	void markAsCompleted(long userId, long missionId) throws DataNotExistException;
}
