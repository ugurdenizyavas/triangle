package com.deniz.balanced.mission.business.domain;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.Meta;

public class MissionDto extends AbstractDto {

	private final Meta validFromMeta = new Meta();
	private final Meta validToMeta = new Meta();
	private final Meta descriptionMeta = new Meta();
	private final Meta expertiseMeta = new Meta();

	public Meta getValidFromMeta() {
		return this.validFromMeta;
	}

	public Meta getValidToMeta() {
		return this.validToMeta;
	}

	public Meta getDescriptionMeta() {
		return this.descriptionMeta;
	}

	public Meta getExpertiseMeta() {
		return this.expertiseMeta;
	}

}
