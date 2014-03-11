package com.deniz.role.business.domain;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.Meta;


public class AppRoleGroupDto extends AbstractDto
{
	private Meta roleGroupNameMeta = new Meta();

	public Meta getRoleGroupNameMeta()
	{
		return roleGroupNameMeta;
	}

	@Override
	public String getInfo()
	{
		return roleGroupNameMeta.getValue();
	}


}
