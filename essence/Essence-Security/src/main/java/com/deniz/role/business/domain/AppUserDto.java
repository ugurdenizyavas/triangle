package com.deniz.role.business.domain;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.Meta;
import com.deniz.framework.dto.Meta.ValueMode;


public class AppUserDto extends AbstractDto
{

	private Meta userNameMeta = new Meta();
	private Meta passwordMeta = new Meta();
	private Meta userGroupsMeta = new Meta( ValueMode.VALUE_LIST );

	public Meta getUserNameMeta()
	{
		return userNameMeta;
	}

	public Meta getPasswordMeta()
	{
		return passwordMeta;
	}

	public Meta getUserGroupsMeta()
	{
		return userGroupsMeta;
	}

	@Override
	public String getInfo()
	{
		return userNameMeta.getValue();
	}


}
