package com.deniz.balanced.business.impl;

import com.deniz.balanced.business.ExperienceBackendService;
import com.deniz.balanced.mission.persistence.enums.TaskLevelEnum;
import com.deniz.balanced.user.business.UserBackendService;
import com.deniz.balanced.user.business.exception.NotValidIdException;
import com.deniz.balanced.user.persistence.entity.UserEntity;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Required;

import java.text.DecimalFormat;
import java.util.List;

public class ExperienceBackendServiceImpl implements ExperienceBackendService {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	private UserBackendService userBackendService;
	private String signupExperience;
	private String easyExperience;
	private String mediumExperience;
	private String hardExperience;

	@Required
	public void setEasyExperience(String easyExperience) {
		this.easyExperience = easyExperience;
	}

	@Required
	public void setMediumExperience(String mediumExperience) {
		this.mediumExperience = mediumExperience;
	}

	@Required
	public void setHardExperience(String hardExperience) {
		this.hardExperience = hardExperience;
	}

	@Required
	public void setSignupExperience(String signupExperience) {
		this.signupExperience = signupExperience;
	}

	@Required
	public void setUserBackendService(UserBackendService userBackendService) {
		this.userBackendService = userBackendService;
	}

	private double findDeltaExperience(double baseExperience,
			int heritageDegree, Integer level) {
		double deltaExperience = (baseExperience * level * Math.sqrt(level))
				/ Math.sqrt(heritageDegree);
		DecimalFormat df = new DecimalFormat("#.##");
		return Double.parseDouble(StringUtils.replace(df.format(deltaExperience), ",", "."));
	}

	@Override
	public void addExperience(Long userId, TaskLevelEnum expertiseEnum)
			throws NotValidIdException {
		String experience = "";
		if (expertiseEnum == TaskLevelEnum.EASY) {
			experience = this.easyExperience;
		} else if (expertiseEnum == TaskLevelEnum.MEDIUM) {
			experience = this.mediumExperience;
		} else if (expertiseEnum == TaskLevelEnum.HARD) {
			experience = this.hardExperience;
		} else {
			experience = this.signupExperience;
		}
		List<UserEntity> ancestors = this.userBackendService
				.getAncestorEntities(userId);
		for (int i = 0; i < ancestors.size(); i++) {
			UserEntity user = ancestors.get(i);
			int heritageDegree = i + 1;
			Integer level = user.getCurrentLevel();
			double deltaExperience = findDeltaExperience(
					Double.parseDouble(experience), heritageDegree, level);
			double pastExperience = user.getExperience();
			double currentExperience = pastExperience + deltaExperience;
			user.setExperience(currentExperience);
			this.userBackendService.update(user);
			this.logger.debug(user.getInfo() + " has gained " + deltaExperience
					+ " experience. Its new experience is " + currentExperience
					+ " and level is " + user.getCurrentLevel());
		}
	}

}
