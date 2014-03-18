package com.deniz.balanced.user.business.domain;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.Meta;

public class UserDto extends AbstractDto {
	protected final Meta emailMeta = new Meta();
	protected final Meta experienceMeta = new Meta();
	protected final Meta ancestorMeta = new Meta();
	protected final Meta currentLevelMeta = new Meta();
	protected final Meta balanceMeta = new Meta();
	protected final Meta referenceMeta = new Meta();

	public Meta getEmailMeta() {
		return this.emailMeta;
	}

	public Meta getExperienceMeta() {
		return this.experienceMeta;
	}

	public Meta getAncestorMeta() {
		return this.ancestorMeta;
	}

	public Meta getCurrentLevelMeta() {
		return this.currentLevelMeta;
	}

	public Meta getBalanceMeta() {
		return this.balanceMeta;
	}

	public Meta getReferenceMeta() {
		return this.referenceMeta;
	}

}
