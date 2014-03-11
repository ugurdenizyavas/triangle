package com.deniz.role.persistence.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;

import com.deniz.framework.persistence.entity.AbstractEntity;

@SuppressWarnings( "serial" )
@Entity
@Table( uniqueConstraints = { @UniqueConstraint( columnNames = { "ROLE_GROUP_NAME" } ) } )
@SequenceGenerator( name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "APP_ROLE_GROUP_SEQ" )
public class AppRoleGroupEntity extends AbstractEntity
{
	private String roleGroupName;

	@Column(name = "ROLE_GROUP_NAME")
	public String getRoleGroupName()
	{
		return roleGroupName;
	}

	public void setRoleGroupName( String roleGroupName )
	{
		this.roleGroupName = roleGroupName;
	}
	@Transient
	@Override
	public String getInfo()
	{
		return roleGroupName;
	}


}
