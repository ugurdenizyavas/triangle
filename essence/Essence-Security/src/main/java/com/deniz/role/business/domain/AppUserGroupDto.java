package com.deniz.role.business.domain;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.Meta;
import com.deniz.framework.dto.Meta.ValueMode;


public class AppUserGroupDto extends AbstractDto
{

	private Meta userGroupNameMeta = new Meta();
	private Meta roleGroupsMeta = new Meta( ValueMode.VALUE_LIST );

	public Meta getUserGroupNameMeta()
	{
		return userGroupNameMeta;
	}

	public Meta getRoleGroupsMeta()
	{
		return roleGroupsMeta;
	}

	@Override
	public String getInfo()
	{
		return userGroupNameMeta.getValue();
	}


}
