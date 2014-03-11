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
@Table( uniqueConstraints = { @UniqueConstraint( columnNames = { "USER_GROUP_NAME" } ) } )
@SequenceGenerator( name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "APP_USER_GROUP_SEQ" )
public class AppUserGroupEntity extends AbstractEntity
{

	private String userGroupName;


	@Column(name = "USER_GROUP_NAME")
	public String getUserGroupName()
	{
		return userGroupName;
	}


	public void setUserGroupName( String userGroupName )
	{
		this.userGroupName = userGroupName;
	}

	@Transient
	@Override
	public String getInfo()
	{
		return userGroupName;
	}
}
