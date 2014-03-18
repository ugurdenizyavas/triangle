package com.deniz.balanced.mission.business.impl;

import com.deniz.balanced.framework.business.impl.AbstractBackendService;
import com.deniz.balanced.framework.dao.FrameworkDao;
import com.deniz.balanced.mission.business.MissionBackendService;
import com.deniz.balanced.mission.persistence.MissionDao;
import com.deniz.balanced.mission.persistence.UserMissionDao;
import com.deniz.balanced.mission.persistence.entity.MissionEntity;
import com.deniz.balanced.mission.persistence.entity.UserMissionEntity;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import java.util.Date;
import java.util.List;

public class MissionBackendServiceImpl extends AbstractBackendService<MissionEntity> implements MissionBackendService {
	private MissionDao dao;
	private UserMissionDao userMissionDao;
	private UserBackendService userBackendService;

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	@Required
	public void setUserBackendService(UserBackendService userBackendService) {
		this.userBackendService = userBackendService;
	}

	@Required
	public void setUserMissionDao(UserMissionDao userMissionDao) {
		this.userMissionDao = userMissionDao;
	}

	@Override
	protected FrameworkDao<MissionEntity> getDao() {
		return this.dao;
	}

	@Required
	public void setDao(MissionDao dao) {
		this.dao = dao;
	}

	@Override
	public List<MissionEntity> getValidMissions(Date validity) {
		Validate.notNull(validity);
		return this.dao.getValidMissions(validity);

	}

	@Override
	public boolean checkCompletionStatus(long userId, long missionId) throws DataNotExistException, NotValidIdException {
		Validate.notNull(userId);
		Validate.notNull(missionId);
		UserEntity user = this.userBackendService.getById(userId);
		MissionEntity mission = getById(missionId);
		UserMissionEntity userMissionEntity = this.userMissionDao.getByUserAndMission(user, mission);
		if (userMissionEntity != null) {
			return true;
		}
		return false;
	}

	@Override
	public void markAsCompleted(long userId, long missionId) throws DataNotExistException {
		Validate.notNull(userId);
		Validate.notNull(missionId);
		try {
			UserMissionEntity userMissionEntity = new UserMissionEntity();
			MissionEntity mission = getById(missionId);
			UserEntity user = this.userBackendService.getById(userId);
			userMissionEntity.setMission(mission);
			userMissionEntity.setUser(user);
			userMissionEntity.setSimpleName(user.getSimpleName() + mission.getSimpleName());
			this.userMissionDao.save(userMissionEntity);
			this.logger.debug("User " + user.getInfo() + " has completed mission: " + mission.getInfo());
		} catch (NotValidIdException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
