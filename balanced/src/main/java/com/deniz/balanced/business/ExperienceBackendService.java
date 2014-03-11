package com.deniz.balanced.business;

import com.deniz.balanced.mission.persistence.enums.TaskLevelEnum;
import com.deniz.balanced.user.business.exception.NotValidIdException;

public interface ExperienceBackendService {

	/**
	 * Add experience according to the hardness of the mission to the user with
	 * given id
	 * 
	 * @param userId
	 *            id of current user
	 * @param expertiseEnum
	 *            expertise of mission
	 * @throws NotValidIdException
	 *             throws if a critical fail is detected
	 */
	public void addExperience(Long id, TaskLevelEnum expertiseEnum) throws NotValidIdException;

}
