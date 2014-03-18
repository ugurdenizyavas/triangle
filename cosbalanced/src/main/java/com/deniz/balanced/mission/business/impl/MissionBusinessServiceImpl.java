package com.deniz.balanced.mission.business.impl;

import com.deniz.balanced.business.ExperienceBackendService;
import com.deniz.balanced.framework.business.FrameworkBackendService;
import com.deniz.balanced.framework.business.impl.AbstractBusinessService;
import com.deniz.balanced.mission.business.MissionBackendService;
import com.deniz.balanced.mission.business.MissionBusinessService;
import com.deniz.balanced.mission.business.domain.MissionDto;
import com.deniz.balanced.mission.persistence.entity.MissionEntity;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.exception.DataAlreadyExistException;
import com.deniz.balanced.user.business.exception.MissionAlreadyCompletedException;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;
import org.apache.commons.lang.Validate;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Transactional
public class MissionBusinessServiceImpl extends AbstractBusinessService<MissionDto, MissionEntity> implements MissionBusinessService {

	protected MissionBackendService backendService;
	protected UserBackendService userBackendService;
	protected ExperienceBackendService experienceBackendService;

	@Required
	public void setExperienceBackendService(ExperienceBackendService experienceBackendService) {
		this.experienceBackendService = experienceBackendService;
	}

	@Required
	public void setUserBackendService(UserBackendService userBackendService) {
		this.userBackendService = userBackendService;
	}

	@Override
	protected FrameworkBackendService<MissionEntity> getBackendService() {
		return this.backendService;
	}

	@Required
	public void setBackendService(MissionBackendService backendService) {
		this.backendService = backendService;
	}

	@Override
	public List<MissionDto> getValidMissions(Date validity) {
		Validate.notNull(validity);
		List<MissionEntity> validMissionEntities = this.backendService.getValidMissions(validity);
		return this.converter.convertEntityList(this.objectConverterService, validMissionEntities);
	}

	@Override
	public void completeMissionForUser(String username, String missionName) throws DataNotExistException, MissionAlreadyCompletedException, NotValidIdException {
		Validate.notNull(username);
		Validate.notNull(missionName);
		Long userId = this.userBackendService.getByName(username).getId();
		MissionEntity mission = this.backendService.getByName(missionName);
		Long missionId = mission.getId();
		boolean isCompleted = this.backendService.checkCompletionStatus(userId, missionId);
		if (isCompleted) {
			throw new MissionAlreadyCompletedException();
		}

		this.backendService.markAsCompleted(userId, missionId);

		this.experienceBackendService.addExperience(userId, mission.getExpertise());
	}

	@Override
	public void addMission(MissionDto missionDto) throws DataAlreadyExistException {
		Validate.notNull(missionDto);
		MissionEntity missionEntity = this.converter.convertDto(this.objectConverterService, missionDto);
		this.backendService.save(missionEntity);
	}

}
