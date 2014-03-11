package com.deniz.balanced.mission.persistence;

import java.util.Date;
import java.util.List;

import com.deniz.balanced.framework.dao.FrameworkDao;
import com.deniz.balanced.mission.persistence.entity.MissionEntity;

public interface MissionDao extends FrameworkDao<MissionEntity> {

	/**
	 * Gets missions which are valid on specified day
	 * 
	 * @param validity
	 *            specified day
	 * @return valid missions
	 */
	List<MissionEntity> getValidMissions(Date validity);

}
