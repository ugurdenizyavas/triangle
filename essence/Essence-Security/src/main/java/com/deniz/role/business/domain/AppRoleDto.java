package com.deniz.role.business.domain;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.dto.Meta;


public class AppRoleDto extends AbstractDto
{

	private Meta roleNameMeta = new Meta();
	private Meta roleGroupMeta = new Meta();
	private Meta domainMeta = new Meta();
	private Meta loginRequiredMeta = new Meta();


	public Meta getRoleNameMeta()
	{
		return roleNameMeta;
	}


	public Meta getRoleGroupMeta()
	{
		return roleGroupMeta;
	}


	public Meta getDomainMeta()
	{
		return domainMeta;
	}


	public Meta getLoginRequiredMeta()
	{
		return loginRequiredMeta;
	}


	@Override
	public String getInfo()
	{
		return roleNameMeta.getValue();
	}

}
