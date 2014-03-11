package com.deniz.balanced.business.impl;

import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import com.deniz.balanced.mission.persistence.enums.TaskLevelEnum;
import com.deniz.balanced.business.ExperienceBackendService;
import com.deniz.balanced.business.ExperienceBusinessService;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.framework.dto.converter.business.impl.valueconverter.exception.DataNotExistException;

public class ExperienceBusinessServiceImpl implements ExperienceBusinessService {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	private ExperienceBackendService experienceBackendService;
	private UserBackendService userBackendService;

	@Required
	public void setUserBackendService(UserBackendService userBackendService) {
		this.userBackendService = userBackendService;
	}

	@Required
	public void setExperienceBackendService(ExperienceBackendService experienceBackendService) {
		this.experienceBackendService = experienceBackendService;
	}

	@Override
	public void addExperience(String username, String expertise) throws NotValidIdException, DataNotExistException {
		Validate.notNull(username);
		Validate.notNull(expertise);
		TaskLevelEnum expertiseEnum;
		try {
			expertiseEnum = TaskLevelEnum.valueOf(expertise);
		} catch (Exception e) {
			this.logger.error("Definition error for TaskLevelEnum : " + expertise);
			throw new RuntimeException();
		}
		this.experienceBackendService.addExperience(this.userBackendService.getByName(username).getId(), expertiseEnum);
	}

	@Override
	public void addSignupExperience(String username) throws DataNotExistException, NotValidIdException {
		Validate.notNull(username);
		addExperience(username, "SIGNUP");
	}
}
