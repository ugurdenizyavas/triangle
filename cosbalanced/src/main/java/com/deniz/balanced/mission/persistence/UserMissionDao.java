package com.deniz.balanced.mission.persistence;

import com.deniz.balanced.framework.dao.FrameworkDao;
import com.deniz.balanced.mission.persistence.entity.MissionEntity;
import com.deniz.balanced.mission.persistence.entity.UserMissionEntity;
import com.deniz.balanced.user.persistence.entity.UserEntity;

public interface UserMissionDao extends FrameworkDao<UserMissionEntity> {

	/**
	 * Gets User Mission Entity if username and missionname matches
	 * 
	 * @param username
	 * @param missionName
	 * @return
	 */
	UserMissionEntity getByUserAndMission(UserEntity user, MissionEntity mission);

}
