package com.deniz.balanced.user.business.domain;

import com.deniz.framework.dto.Meta;

public class BabyDto extends UserDto {

	public BabyDto() {
		this.experienceMeta.setValue("0.0");
		this.currentLevelMeta.setValue("1");
		this.balanceMeta.setValue("0.0");
	}

	private final Meta passwordMeta = new Meta();

	public Meta getPasswordMeta() {
		return this.passwordMeta;
	}

}
