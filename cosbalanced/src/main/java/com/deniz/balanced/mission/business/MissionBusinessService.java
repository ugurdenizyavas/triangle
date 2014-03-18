package com.deniz.balanced.mission.business;

import com.deniz.balanced.framework.business.FrameworkBusinessService;
import com.deniz.balanced.mission.business.domain.MissionDto;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.MissionAlreadyCompletedException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Transactional
public interface MissionBusinessService extends FrameworkBusinessService<MissionDto> {

	/**
	 * Returns missions that are valid on specified day
	 * 
	 * @param validity
	 *            specified day
	 * @return valid mission dto list
	 */
	List<MissionDto> getValidMissions(Date validity);

	/**
	 * Mark mission as completed for that user and add experience to current
	 * user and its ancestors
	 * 
	 * @param userName
	 *            name of current user
	 * @param missionName
	 *            name of completed mission
	 * @throws com.deniz.balanced.user.business.exception.MissionAlreadyCompletedException
	 *             throws if user has already completed that mission
	 * @throws com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException
	 *             throws if data with given name does not exist
	 * @throws com.deniz.balanced.user.business.exception.NotValidIdException
	 *             throws if a critical fail is detected
	 */
	void completeMissionForUser(String userName, String missionName) throws DataNotExistException, MissionAlreadyCompletedException, NotValidIdException;

	/**
	 * Adds the mission in the given dto format
	 *
	 * @param missionDto
	 *            mission dto
	 * @throws com.deniz.balanced.user.business.exception.DataAlreadyExistException
	 *             throws if same data exist ( simpleName must be unique)
	 */
	void addMission(MissionDto missionDto) throws DataAlreadyExistException;

}
